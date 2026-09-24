import { useCallback, useEffect, useRef, useState } from 'react';
import { WS_URL } from '../../../shared/api/config';
import { useAuth } from '../../auth/hooks/useAuth';

const PING_INTERVAL_MS = 30_000;
const RECONNECT_DELAY_MS = 2_000;
const MAX_RECONNECT_ATTEMPTS = 3;
const STREAM_INACTIVITY_TIMEOUT_MS = 6_000;
// Первый токен сейчас приходит через 1–2 минуты (PROBLEMS.md#14): холодный старт модели
// и извлечение сущностей через LLM. Таймаут с запасом, чтобы не обрывать нормальные ответы.
const FIRST_TOKEN_TIMEOUT_MS = 180_000;
const FIRST_TOKEN_TIMEOUT_MESSAGE = 'Ответ не пришёл, попробуйте ещё раз.';

const generateRequestId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function useChatSocket() {
  const { accessToken, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const pingTimerRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const closedByUserRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const streamWatchdogRef = useRef(null);
  const firstTokenTimerRef = useRef(null);
  // Дублирует streamingId для колбэков таймеров и handleFrame: в их замыканиях стейт устаревший.
  const streamingIdRef = useRef(null);
  // Ответы, снятые по таймауту первого токена: пузырь уже убран, их поздние чанки не нужны.
  const abandonedIdsRef = useRef(new Set());

  const [status, setStatus] = useState('idle'); // idle | connecting | connected | error | closed
  const [messages, setMessages] = useState([]);
  const [streamingId, setStreamingIdState] = useState(null);
  const [error, setError] = useState(null);

  const setStreamingId = useCallback((id) => {
    streamingIdRef.current = id;
    setStreamingIdState(id);
  }, []);

  const sendFrame = useCallback((payload) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(payload));
    return true;
  }, []);

  const clearStreamWatchdog = useCallback(() => {
    if (streamWatchdogRef.current) {
      clearTimeout(streamWatchdogRef.current);
      streamWatchdogRef.current = null;
    }
  }, []);

  const clearFirstTokenTimer = useCallback(() => {
    if (firstTokenTimerRef.current) {
      clearTimeout(firstTokenTimerRef.current);
      firstTokenTimerRef.current = null;
    }
  }, []);

  const clearStreamTimers = useCallback(() => {
    clearStreamWatchdog();
    clearFirstTokenTimer();
  }, [clearStreamWatchdog, clearFirstTokenTimer]);

  // Заплатка под потерю message_completed (PROBLEMS.md#6): ловит тишину уже после начала стрима.
  // До первого токена её взводить нельзя — модель может думать минутами.
  const armStreamWatchdog = useCallback((assistantMessageId) => {
    clearStreamWatchdog();
    streamWatchdogRef.current = setTimeout(() => {
      streamWatchdogRef.current = null;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId ? { ...m, streaming: false } : m,
        ),
      );
      if (streamingIdRef.current === assistantMessageId) setStreamingId(null);
    }, STREAM_INACTIVITY_TIMEOUT_MS);
  }, [clearStreamWatchdog, setStreamingId]);

  const armFirstTokenTimer = useCallback((assistantMessageId, delayMs = FIRST_TOKEN_TIMEOUT_MS) => {
    clearFirstTokenTimer();
    firstTokenTimerRef.current = setTimeout(() => {
      firstTokenTimerRef.current = null;
      if (streamingIdRef.current !== assistantMessageId) return;
      abandonedIdsRef.current.add(assistantMessageId);
      setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId));
      setStreamingId(null);
      setError(FIRST_TOKEN_TIMEOUT_MESSAGE);
    }, delayMs);
  }, [clearFirstTokenTimer, setStreamingId]);

  const handleFrame = useCallback((frame) => {
    switch (frame.type) {
      case 'connected':
        sendFrame({ type: 'history_get', limit: 20, before_message_id: null });
        return;

      case 'history_page': {
        const items = Array.isArray(frame.items) ? frame.items : [];
        const ordered = [...items].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        setMessages((prev) => {
          if (prev.length === 0) return ordered;
          const known = new Set(prev.map((m) => m.id));
          const merged = ordered.filter((m) => !known.has(m.id));
          return [...merged, ...prev];
        });

        // Страница перезагружена, пока модель думала: бэк уже записал пустой ответ, а
        // чанки продолжат приходить на новое соединение (сессия у пользователя одна).
        // Статуса в истории нет — считаем ответ незаконченным, если он пустой и свежий.
        const last = ordered[ordered.length - 1];
        if (last && last.role === 'assistant' && !last.content && !streamingIdRef.current) {
          const remainingMs = FIRST_TOKEN_TIMEOUT_MS - (Date.now() - new Date(last.created_at).getTime());
          if (remainingMs > 0) {
            setStreamingId(last.id);
            armFirstTokenTimer(last.id, remainingMs);
          }
        }
        return;
      }

      case 'message_started': {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === frame.request_id || m.requestId === frame.request_id
              ? { ...m, id: frame.user_message_id }
              : m,
          ).concat({
            id: frame.assistant_message_id,
            role: 'assistant',
            content: '',
            streaming: true,
          }),
        );
        setStreamingId(frame.assistant_message_id);
        armFirstTokenTimer(frame.assistant_message_id);
        return;
      }

      case 'stream_chunk': {
        const id = frame.assistant_message_id;
        if (abandonedIdsRef.current.has(id)) return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, content: m.content + (frame.delta ?? '') } : m,
          ),
        );
        // Таймеры принадлежат текущему запросу. Хвост старого ответа, дописывающийся после
        // срабатывания watchdog, их трогать не должен — иначе сбил бы таймеры нового вопроса.
        if (id === streamingIdRef.current) {
          clearFirstTokenTimer();
          armStreamWatchdog(id);
        }
        return;
      }

      case 'message_completed': {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === frame.assistant_message_id ? { ...m, streaming: false } : m,
          ),
        );
        if (frame.assistant_message_id === streamingIdRef.current) {
          clearStreamTimers();
          setStreamingId(null);
        }
        return;
      }

      case 'message_error':
      case 'error': {
        clearStreamTimers();
        setError(frame.message || 'Произошла ошибка при обработке запроса.');
        setMessages((prev) =>
          prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
        );
        setStreamingId(null);
        return;
      }

      case 'pong':
      case 'feedback_saved':
      case 'feedback_set':
      case 'question_accepted':
      case 'generation_started':
      case 'status':
      case 'info':
      case 'ok':
        return;

      default:
        return;
    }
  }, [
    sendFrame,
    setStreamingId,
    armStreamWatchdog,
    armFirstTokenTimer,
    clearFirstTokenTimer,
    clearStreamTimers,
  ]);

  const cleanupTimers = useCallback(() => {
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return undefined;
    closedByUserRef.current = false;
    reconnectAttemptsRef.current = 0;

    const connect = () => {
      if (!accessToken) return;
      if (socketRef.current && socketRef.current.readyState <= WebSocket.OPEN) return;

      setStatus('connecting');
      setError(null);
      const url = `${WS_URL}?token=${encodeURIComponent(accessToken)}`;
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.addEventListener('open', () => {
        if (socketRef.current !== socket) {
          socket.close();
          return;
        }
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
        pingTimerRef.current = setInterval(() => {
          sendFrame({ type: 'ping' });
        }, PING_INTERVAL_MS);
      });

      socket.addEventListener('message', (event) => {
        if (socketRef.current !== socket) return;
        let frame;
        try {
          frame = JSON.parse(event.data);
        } catch {
          return;
        }
        handleFrame(frame);
      });

      socket.addEventListener('error', () => {
        if (socketRef.current !== socket) return;
        setStatus('error');
      });

      socket.addEventListener('close', () => {
        if (socketRef.current !== socket) return;
        cleanupTimers();
        socketRef.current = null;
        setStatus('closed');
        if (closedByUserRef.current) return;
        if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setError('Не удалось подключиться к серверу. Перезагрузите страницу.');
          return;
        }
        reconnectAttemptsRef.current += 1;
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      });
    };

    connect();

    return () => {
      closedByUserRef.current = true;
      cleanupTimers();
      clearStreamTimers();
      const socket = socketRef.current;
      if (
        socket &&
        (socket.readyState === WebSocket.CONNECTING ||
          socket.readyState === WebSocket.OPEN)
      ) {
        socket.close();
      }
      socketRef.current = null;
    };
  }, [accessToken, isAuthenticated, cleanupTimers, clearStreamTimers, handleFrame, sendFrame]);

  const sendQuestion = useCallback(
    (content) => {
      const trimmed = content.trim();
      if (!trimmed) return false;
      const requestId = generateRequestId();
      const ok = sendFrame({ type: 'question', request_id: requestId, content: trimmed });
      if (!ok) {
        setError('Нет соединения с сервером. Попробуйте позже.');
        return false;
      }
      setError(null);
      setMessages((prev) => [
        ...prev,
        { id: requestId, requestId, role: 'user', content: trimmed },
      ]);
      return true;
    },
    [sendFrame],
  );

  return {
    status,
    messages,
    streamingId,
    error,
    sendQuestion,
    isStreaming: Boolean(streamingId),
  };
}
