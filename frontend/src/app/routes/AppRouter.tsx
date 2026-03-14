import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { HQPage } from "../pages/HQPage";
import { OutletPage } from "../pages/OutletPage";
import { APP_ROUTES } from "./routePaths";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={APP_ROUTES.root} element={<HQPage />} />
        <Route path={APP_ROUTES.outlet} element={<OutletPage />} />
        <Route path="*" element={<Navigate to={APP_ROUTES.root} replace />} />
      </Route>
    </Routes>
  );
}
