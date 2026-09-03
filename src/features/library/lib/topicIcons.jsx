import { FolderIcon } from '../../../shared/ui/icons';

// MOCK: TopicSchema не отдаёт иконку/ключ иконки для темы (docs/PROBLEMS.md#11).
// Единая точка замены, когда появится реальный маппинг от бэка или дизайна.
export function renderTopicIcon(name, className) {
  return <FolderIcon className={className} />;
}
