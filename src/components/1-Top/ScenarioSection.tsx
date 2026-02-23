
import type { CSSProperties } from "react";
import { useScenarioTabNavigate } from '../../lib/useScenarioTabNavigate';

export function ScenarioSection() {
  const sectionStyle = { '--float-delay': '0.2s' } as CSSProperties;
  const goScenarioTab = useScenarioTabNavigate();

  return (
    <section
      className="floatingSection cardSection"
      style={sectionStyle}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className="sectionLabelRow">
          <span className="sectionLabelIcon">✦</span>
          <span className="sectionLabelText">Scenario</span>
          <span className="sectionLabelIcon">✦</span>
        </div>
        <p className="sectionDescription">
          シナリオ通過報告リスト、GM可能シナリオリストを掲載します。
        </p>
        <div className="sectionButtonRow" style={{ marginTop: 20 }}>
          <button
            type="button"
            className="detailButton"
            onClick={() => goScenarioTab('passed')}
          >
            PASSED LIST
          </button>
          <button
            type="button"
            className="detailButton"
            onClick={() => goScenarioTab('gm-ready')}
          >
            GM LIST
          </button>
        </div>
      </div>
    </section>
  );
}
