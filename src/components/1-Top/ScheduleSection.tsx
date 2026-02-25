import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

export function ScheduleSection() {
  const sectionStyle = { '--float-delay': '0.1s' } as CSSProperties;

  return (
    <section
      className="floatingSection cardSection"
      style={sectionStyle}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className="sectionLabelRow">
          <span className="sectionLabelIcon">✦</span>
          <span className="sectionLabelText">Schedule</span>
          <span className="sectionLabelIcon">✦</span>
        </div>
        <p className="sectionDescription">
          予定はCALENDARから確認できます。
        </p>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/schedule" className="detailButton">
            CALENDAR
          </Link>
        </div>
      </div>
    </section>
  );
}
