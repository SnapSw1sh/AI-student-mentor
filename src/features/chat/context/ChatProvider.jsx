import { ChatContext } from './ChatContext';
import { useChatSocket } from '../hooks/useChatSocket';

// Соединение и переписка живут выше страницы чата: при переходе в другой раздел сокет
// не закрывается, и, вернувшись, пользователь видит ответ в том же состоянии —
// «думает» или допечатывается, а не пустой пузырь из истории.
export function ChatProvider({ children }) {
  const chat = useChatSocket();
  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
}
