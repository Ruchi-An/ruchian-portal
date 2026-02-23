import { useNavigate } from "react-router-dom";

/**
 * シナリオページの特定のタブに遷移するためのカスタムフック
 * @returns タブを指定してシナリオページに遷移する関数
 */
export function useScenarioTabNavigate() {
  const navigate = useNavigate();
  
  /**
   * 指定したタブでシナリオページに遷移
   * @param tab - 'planned': 通過予定シナリオタブ, 'passed': 通過済みシナリオタブ, 'gm-ready': GM可能シナリオタブ
   */
  return (tab: 'planned' | 'passed' | 'gm-ready') => {
    navigate(`/scenario?tab=${tab}`);
  };
}
