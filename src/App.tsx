import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './components/home/HomePage.tsx';
import Header from './components/layout/Header.tsx';
import { DataProvider } from './lib/DataContext.tsx';

const SchedulePage = lazy(() =>
  import('./components/schedule/SchedulePage.tsx').then((module) => ({ default: module.SchedulePage })),
);
const ScenarioPage = lazy(() =>
  import('./components/scenario/ScenarioPage.tsx').then((module) => ({ default: module.ScenarioPage })),
);
const GMScenarioDetailPage = lazy(() =>
  import('./components/scenario/GMScenarioDetailPage.tsx').then((module) => ({ default: module.GMScenarioDetailPage })),
);
const ScenarioDetailPage = lazy(() =>
  import('./components/scenario/ScenarioDetailPage.tsx').then((module) => ({ default: module.ScenarioDetailPage })),
);

function RouteLoader() {
  return <div>読み込み中...</div>;
}

export default function App() {
  return (
    <DataProvider>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
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
          path="/scenario/detail/:id"
          element={(
            <Suspense fallback={<RouteLoader />}>
              <ScenarioDetailPage />
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