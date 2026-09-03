import { DocumentIcon } from '../../../shared/ui/icons';

// MOCK: content_type пока не маппится на отдельные иконки по типу файла — нет дизайн-набора.
// Единая точка замены, когда появится набор иконок по content_type.
export function renderDocumentIcon(contentType, className) {
  return <DocumentIcon className={className} />;
}
