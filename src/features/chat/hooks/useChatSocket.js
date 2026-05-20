import { useCallback, useEffect, useRef, useState } from 'react';
import { WS_URL } from '../../../shared/api/config';
import { useAuth } from '../../auth/hooks/useAuth';

const PING_INTERVAL_MS = 30_000;
const RECONNECT_DELAY_MS = 2_000;
const MAX_RECONNECT_ATTEMPTS = 3;
const STREAM_INACTIVITY_TIMEOUT_MS = 6_000;

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

  const [status, setStatus] = useState('idle'); // idle | connecting | connected | error | closed
  const [messages, setMessages] = useState([]);
  const [streamingId, setStreamingId] = useState(null);
  const [error, setError] = useState(null);

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

  const armStreamWatchdog = useCallback((assistantMessageId) => {
    clearStreamWatchdog();
    streamWatchdogRef.current = setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId ? { ...m, streaming: false } : m,
        ),
      );
      setStreamingId(null);
    }, STREAM_INACTIVITY_TIMEOUT_MS);
  }, [clearStreamWatchdog]);

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
        armStreamWatchdog(frame.assistant_message_id);
        return;
      }

      case 'stream_chunk': {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === frame.assistant_message_id
              ? { ...m, content: m.content + (frame.delta ?? '') }
              : m,
          ),
        );
        armStreamWatchdog(frame.assistant_message_id);
        return;
      }

      case 'message_completed': {
        clearStreamWatchdog();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === frame.assistant_message_id ? { ...m, streaming: false } : m,
          ),
        );
        setStreamingId(null);
        return;
      }

      case 'message_error':
      case 'error': {
        clearStreamWatchdog();
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
  }, [sendFrame, armStreamWatchdog, clearStreamWatchdog]);

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
      clearStreamWatchdog();
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
  }, [accessToken, isAuthenticated, cleanupTimers, clearStreamWatchdog, handleFrame, sendFrame]);

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
