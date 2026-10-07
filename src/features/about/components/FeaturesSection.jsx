import { FEATURES } from '../data/features';
import { FeatureCard } from './FeatureCard';
import styles from './FeaturesSection.module.css';

export function FeaturesSection() {
  return (
    <section className={styles.section} aria-labelledby="features-title">
      <h2 id="features-title" className={styles.title}>
        Что умеет Student Mentor?
      </h2>
      <div className={styles.grid}>
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </section>
  );
}
