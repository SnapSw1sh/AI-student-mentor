export const API_BASE_URL = '/api';
export const WS_URL = (() => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/chat/ws/chat`;
})();
