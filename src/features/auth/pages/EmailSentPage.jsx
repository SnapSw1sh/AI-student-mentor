import { MailSentIcon } from '../../../shared/ui/icons';
import { StatusPage } from '../components/StatusPage';

export function EmailSentPage() {
  return (
    <StatusPage
      icon={<MailSentIcon />}
      title="Письмо отправлено"
      text="Если аккаунт с такой почтой существует, мы отправили на неё письмо с инструкцией по сбросу пароля. Если письма нет, проверьте папку «Спам»."
      action={{ to: '/login', label: 'Вернуться ко входу' }}
    />
  );
}
