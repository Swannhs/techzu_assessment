import { AppRouter } from "./routes/AppRouter";
import { useAppBootstrap } from "./hooks/useAppBootstrap";

export function App() {
  useAppBootstrap();

  return <AppRouter />;
}
