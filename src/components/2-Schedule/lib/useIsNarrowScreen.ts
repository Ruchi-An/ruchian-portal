// src/components/2-Schedule/lib/useIsNarrowScreen.ts
// ==================== 画面幅判定フック ====================

import { useState, useEffect } from "react";

/**
 * 画面幅が指定値未満かどうかを判定するカスタムフック
 * @param threshold ピクセル数（デフォルト600px）
 */
export function useIsNarrowScreen(threshold: number = 600): boolean {
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < threshold);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [threshold]);
  return isNarrow;
}