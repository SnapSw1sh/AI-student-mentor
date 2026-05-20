import { SuccessCheckIcon } from '../../../shared/ui/icons';
import { StatusPage } from '../components/StatusPage';

export function RegisterSuccessPage() {
  return (
    <StatusPage
      icon={<SuccessCheckIcon />}
      title="Регистрация прошла успешно"
      text="Мы отправили письмо для подтверждения почты. Если его нет, проверьте папку «Спам»."
      action={{ to: '/login', label: 'Вернуться ко входу' }}
    />
  );
}
