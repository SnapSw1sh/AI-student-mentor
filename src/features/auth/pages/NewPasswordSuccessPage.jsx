import { SuccessLockIcon } from '../../../shared/ui/icons';
import { StatusPage } from '../components/StatusPage';

export function NewPasswordSuccessPage() {
  return (
    <StatusPage
      icon={<SuccessLockIcon />}
      title="Пароль успешно изменён"
      titleVariant="newPassword"
      action={{ to: '/login', label: 'Войти' }}
    />
  );
}
