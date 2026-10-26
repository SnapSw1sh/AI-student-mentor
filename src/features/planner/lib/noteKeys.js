// Перенос заметки с клавиатуры — замена перетаскиванию для тех, кто не пользуется мышью:
// Alt+← / → — на день, с Shift — сдвиг окончания. В месяце ещё Alt+↑ / ↓ — на неделю.
export function noteKeyShift(event, { vertical = false } = {}) {
  if (!event.altKey) return null;
  const steps = { ArrowLeft: -1, ArrowRight: 1 };
  if (vertical) Object.assign(steps, { ArrowUp: -7, ArrowDown: 7 });
  const days = steps[event.key];
  if (!days) return null;
  return { mode: event.shiftKey ? 'end' : 'move', days };
}
