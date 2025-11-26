import React from "react";
import styles from "./Hero.module.css"; // CSSモジュールを読み込み

export default function Hero() {
  return (
    <div className={styles.hero}>
      <h1 className={styles.title}>るちあんポータルへようこそ ✨</h1>
      <p className={styles.subtitle}>星の光のように、あなたの世界を彩る場所。</p>
      <div className="hero-buttons">
        <a className="btn" href="#">Twitter</a>
        <a className="btn" href="#">YouTube</a>
        <a className="btn" href="#">Discord</a>
      </div>
    </div>
  );
}
