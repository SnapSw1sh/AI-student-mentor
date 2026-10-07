import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ChevronDownIcon } from '../../../shared/ui/icons';
import styles from './FeatureCard.module.css';

// В раскрытом виде теги стоят между списком и кнопкой, поэтому раскрываются две части
// карточки, а теги остаются на месте в обоих состояниях.
export function FeatureCard({ feature }) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const actionId = useId();

  const cardClass = [styles.card, styles[feature.theme], expanded ? styles.expanded : '']
    .filter(Boolean)
    .join(' ');

  return (
    <article className={cardClass}>
      <h3 className={styles.heading}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={expanded}
          aria-controls={`${detailsId} ${actionId}`}
          onClick={() => setExpanded((value) => !value)}
        >
          <span className={styles.iconBox}>
            <img src={feature.icon} alt="" className={styles.icon} />
          </span>
          <span className={styles.text}>
            <span className={styles.title}>{feature.title}</span>
            <span className={styles.description}>{feature.description}</span>
          </span>
          <span className={styles.indicator} aria-hidden="true">
            {expanded ? (
              <ChevronDownIcon className={styles.chevron} />
            ) : (
              <ArrowRightIcon className={styles.arrow} />
            )}
          </span>
        </button>
      </h3>

      <div id={detailsId} className={styles.collapsible} inert={!expanded}>
        <div className={styles.collapsibleInner}>
          <ul className={styles.points}>
            {feature.points.map((point) => (
              <li key={point} className={styles.point}>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ul className={styles.tags}>
        {feature.tags.map((tag) => (
          <li key={tag} className={styles.tag}>
            {tag}
          </li>
        ))}
      </ul>

      <div id={actionId} className={styles.collapsible} inert={!expanded}>
        <div className={styles.collapsibleInner}>
          <div className={styles.actionRow}>
            <Link to={feature.action.to} className={styles.action}>
              {feature.action.label}
              <ArrowRightIcon className={styles.actionArrow} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
