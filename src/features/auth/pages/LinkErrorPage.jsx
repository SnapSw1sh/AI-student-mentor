import { LinkErrorIcon } from '../../../shared/ui/icons';
import { StatusPage } from '../components/StatusPage';

export function LinkErrorPage() {
  return (
    <StatusPage
      icon={<LinkErrorIcon />}
      title="Ссылка не действительна"
      text="Ссылка для сброса пароля недействительна или устарела."
      action={{ to: '/login', label: 'Вернуться ко входу' }}
    />
  );
}
