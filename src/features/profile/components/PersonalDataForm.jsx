import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EditPencilIcon, ChevronDownIcon } from '../../../shared/ui/icons';
import { useAuth } from '../../auth/hooks/useAuth';
import { ApiError } from '../../../shared/api/httpClient';
import styles from './PersonalDataForm.module.css';

// MOCK: list of programs/groups (PROBLEMS.md#2). Replace with API call when backend provides:
//   GET /api/library/programs    -> { id, label }[]
//   GET /api/library/groups?program=...&year=... -> { id, label }[]
const PROGRAM_OPTIONS = [
  'Информатика и вычислительная техника',
  'Прикладная математика',
  'Инфокоммуникационные технологии и системы связи',
];

const GROUP_OPTIONS = ['1', '2', '3', '4', '5', '6'];

function EditableField({ id, value, placeholder, onChange, error, type = 'text' }) {
  return (
    <label
      htmlFor={id}
      className={`${styles.field} ${error ? styles.fieldError : ''}`.trim()}
    >
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={styles.fieldInput}
      />
      <EditPencilIcon className={styles.fieldIcon} />
    </label>
  );
}

function ReadonlyField({ value, full }) {
  return (
    <div className={`${styles.field} ${full ? styles.fieldFull : ''} ${styles.fieldReadonly}`.trim()}>
      <span className={styles.fieldText}>{value}</span>
    </div>
  );
}

function SelectField({ id, value, placeholder, onChange, options, error, full }) {
  return (
    <label
      htmlFor={id}
      className={`${styles.field} ${full ? styles.fieldFull : ''} ${error ? styles.fieldError : ''}`.trim()}
    >
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${styles.fieldInput} ${styles.fieldSelect} ${!value ? styles.fieldPlaceholder : ''}`.trim()}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDownIcon className={styles.fieldIcon} />
    </label>
  );
}

function buildInitialForm(user) {
  return {
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    faculty: '',
    program: '',
    year: user?.year != null ? String(user.year) : '',
    group_name: user?.group_name ?? '',
  };
}

export function PersonalDataForm() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState(() => buildInitialForm(user));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [saved, setSaved] = useState(false);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');

    const next = {};
    ['first_name', 'last_name', 'faculty', 'program', 'year', 'group_name'].forEach((key) => {
      if (!form[key].toString().trim()) next[key] = true;
    });
    if (form.year.trim() && !/^\d{4}$/.test(form.year.trim())) {
      next.year = true;
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      // TODO(backend): добавить faculty + program, когда бэк расширит /api/users/me (PROBLEMS.md#1)
      await updateProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        year: Number(form.year),
        group_name: form.group_name.trim(),
      });
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setServerError('Проверьте введённые данные.');
      } else {
        setServerError('Не удалось сохранить. Попробуйте позже.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const showProgramError = errors.program;

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <h2 className={styles.title}>Персональные данные</h2>

      <div className={styles.fields}>
        <div className={styles.row}>
          <div className={styles.col}>
            <label htmlFor="first_name" className={styles.label}>Имя</label>
            <EditableField
              id="first_name"
              value={form.first_name}
              placeholder="Имя"
              onChange={(v) => setField('first_name', v)}
              error={errors.first_name}
            />
          </div>
          <div className={styles.col}>
            <label htmlFor="last_name" className={styles.label}>Фамилия</label>
            <EditableField
              id="last_name"
              value={form.last_name}
              placeholder="Фамилия"
              onChange={(v) => setField('last_name', v)}
              error={errors.last_name}
            />
          </div>
        </div>

        <div className={styles.colFull}>
          <span className={styles.label}>E-mail</span>
          <ReadonlyField value={user?.email || 'name@edu.hse.ru'} full />
        </div>

        <div className={styles.row}>
          <div className={styles.col}>
            <span className={styles.label}>ВУЗ</span>
            <ReadonlyField value="НИУ ВШЭ" />
          </div>
          <div className={styles.col}>
            <label htmlFor="faculty" className={styles.label}>Факультет</label>
            <EditableField
              id="faculty"
              value={form.faculty}
              placeholder="Факультет"
              onChange={(v) => setField('faculty', v)}
              error={errors.faculty}
            />
          </div>
        </div>

        <div className={styles.colFull}>
          <label htmlFor="program" className={styles.label}>Направление</label>
          <SelectField
            id="program"
            value={form.program}
            placeholder="Выбрать направление"
            onChange={(v) => setField('program', v)}
            options={PROGRAM_OPTIONS}
            error={errors.program}
            full
          />
          {showProgramError && (
            <p className={styles.fieldErrorMessage}>Пропущенное обязательное поле.</p>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.col}>
            <label htmlFor="year" className={styles.label}>Год поступления</label>
            <EditableField
              id="year"
              value={form.year}
              placeholder="202X"
              onChange={(v) => setField('year', v.replace(/\D/g, '').slice(0, 4))}
              error={errors.year}
            />
          </div>
          <div className={styles.col}>
            <label htmlFor="group_name" className={styles.label}>Номер группы</label>
            <SelectField
              id="group_name"
              value={form.group_name}
              placeholder="Выбрать номер"
              onChange={(v) => setField('group_name', v)}
              options={GROUP_OPTIONS}
              error={errors.group_name}
            />
          </div>
        </div>
      </div>

      {serverError && <p className={styles.serverError}>{serverError}</p>}
      {saved && !serverError && <p className={styles.savedMessage}>Изменения сохранены.</p>}

      <div className={styles.actions}>
        <Link to="/" className={styles.actionGhost}>
          Перейти в ИИ-помощник
        </Link>
        <button type="submit" className={styles.actionPrimary} disabled={submitting}>
          {submitting ? 'Сохранение…' : 'Сохранить изменения'}
        </button>
      </div>
    </form>
  );
}
