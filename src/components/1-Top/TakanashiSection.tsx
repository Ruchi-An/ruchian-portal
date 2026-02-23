import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

export function TakanashiSection() {
  const sectionStyle = { '--float-delay': '0.3s' } as CSSProperties;

  return (
    <section
      className="floatingSection cardSection"
      style={sectionStyle}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className="sectionLabelRow">
          <span className="sectionLabelIcon">✦</span>
          <span className="sectionLabelText">Takanashi</span>
          <span className="sectionLabelIcon">✦</span>
        </div>
        <p className="sectionDescription">
          （未実装）
        </p>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/takanashi" className="detailButton">
            VIEW MORE
          </Link>
        </div>
      </div>
    </section>
  );
}
