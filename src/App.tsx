import { lazy, Suspense } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { store } from "./store";
import { ToastProvider } from "./context/ToastContext";
import { TaskActionsProvider } from "./context/TaskActionsContext";
import { PageLoader } from "./components/common/Loader";

// Each page is its own chunk, downloaded only when the route is visited.
const Welcome = lazy(() => import("./pages/Welcome"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ToastProvider>
          <TaskActionsProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/welcome" element={<Navigate to="/" replace />} />
                <Route path="/tasks" element={<Dashboard />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </TaskActionsProvider>
        </ToastProvider>
      </BrowserRouter>
    </Provider>
  );
}
