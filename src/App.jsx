import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import "./App.css";
import Hero from "./components/Hero";
import Header from "./components/Header";
import ScheduleSection from "./components/ScheduleSection";
import GMListSection from "./components/GMListSection";
import ScenarioSection from "./components/ScenarioSection";
import AboutSection from "./components/AboutSection";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="app">
      {/* ヘッダー */}
      <Header />

      {/* ヒーロー */}
      <Hero />

      {/* スケジュール */}
      <ScheduleSection />

      {/* GM可能リスト */}
      <GMListSection />

      {/* シナリオ通過報告 */}
      <ScenarioSection />

      {/* 自鯖紹介・自己紹介・SNSリンク */}
      <AboutSection />

      {/* フッター */}
      <Footer />
    </div>
  );
}

export default App;
