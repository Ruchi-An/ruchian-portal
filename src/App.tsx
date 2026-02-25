import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { DataProvider } from './lib/DataContext.tsx';
import Header from './components/0-Header/Header.tsx';
import Footer from './components/0-Footer/Footer.tsx';
import HeroSection from './components/1-Top/HeroSection.tsx';
import { ScheduleSection } from './components/1-Top/ScheduleSection.tsx';
import { ScenarioSection } from './components/1-Top/ScenarioSection.tsx';

const SchedulePage = lazy(() =>
  import('./components/2-Schedule/Schedule.tsx').then((module) => ({ default: module.SchedulePage })),
);
const ScenarioPage = lazy(() =>
  import('./components/3-Scenario/Scenario.tsx').then((module) => ({ default: module.ScenarioPage })),
);
const GMScenarioDetailPage = lazy(() =>
  import('./components/3-Scenario/GMScenarioDetail.tsx').then((module) => ({ default: module.GMScenarioDetailPage })),
);

function RouteLoader() {
  return <div>読み込み中...</div>;
}

export default function App() {
  return (
    <DataProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/schedule"
          element={(
            <Suspense fallback={<RouteLoader />}>
              <SchedulePage />
            </Suspense>
          )}
        />
        <Route
          path="/scenario"
          element={(
            <Suspense fallback={<RouteLoader />}>
              <ScenarioPage />
            </Suspense>
          )}
        />
        <Route
          path="/scenario/gm/:id"
          element={(
            <Suspense fallback={<RouteLoader />}>
              <GMScenarioDetailPage />
            </Suspense>
          )}
        />
      </Routes>
    </DataProvider>
  );
}

function Home() {
  return (
    <>
      <HeroSection />
      <div className="homeGrid">
        <ScheduleSection />
        <ScenarioSection />
      </div>
      <Footer />
    </>
  );
}