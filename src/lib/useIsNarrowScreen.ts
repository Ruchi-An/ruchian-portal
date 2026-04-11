import { useEffect, useState } from 'react';

/**
 * 画面幅が指定した値より狭いかを返す共通フック
 * どのページからでも使えるので `src/lib` に置いています。
 */
export function useIsNarrowScreen(threshold = 600): boolean {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const checkScreenWidth = () => setIsNarrow(window.innerWidth < threshold);

    checkScreenWidth();
    window.addEventListener('resize', checkScreenWidth);

    return () => window.removeEventListener('resize', checkScreenWidth);
  }, [threshold]);

  return isNarrow;
}
