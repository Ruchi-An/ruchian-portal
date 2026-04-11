import { Star } from 'lucide-react';

type PageHeroProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

/**
 * ページ上部のタイトル表示用コンポーネント
 * 同じ見た目を複数ページで使うため、`common` にまとめています。
 */
export function PageHero({ title, subtitle, className = 'commonHero' }: PageHeroProps) {
  return (
    <section className={className} style={{ paddingBottom: 0 }}>
      <div className="commonTitleRow">
        <Star className="commonTitleIcon" size={28} strokeWidth={2} aria-hidden="true" />
        <h1 className="commonTitle">{title}</h1>
        <Star className="commonTitleIcon" size={28} strokeWidth={2} aria-hidden="true" />
      </div>
      {subtitle && <p className="commonSubtitle">{subtitle}</p>}
    </section>
  );
}
