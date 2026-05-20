import { useState } from 'react';
import { ProfileSidebar } from '../components/ProfileSidebar';
import { PersonalDataForm } from '../components/PersonalDataForm';
import { useAuth } from '../../auth/hooks/useAuth';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Профиль</h1>
      <div className={styles.layout}>
        <ProfileSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          fullName={fullName}
        />
        <PersonalDataForm key={user?.id ?? 'anon'} />
      </div>
    </div>
  );
}
