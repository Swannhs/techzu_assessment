import { PropsWithChildren, ReactElement } from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import { createAppStore, RootState } from "../src/redux/store";

export function renderWithStore(
  ui: ReactElement,
  options?: { preloadedState?: Partial<RootState> }
) {
  const store = createAppStore(options?.preloadedState);

  function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper })
  };
}
