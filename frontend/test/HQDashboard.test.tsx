import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HQDashboard } from "../src/features/hq/components/HQDashboard";
import { renderWithStore } from "./renderWithStore";

describe("HQDashboard", () => {
  it("shows inline validation errors when create outlet form is empty", async () => {
    const user = userEvent.setup();

    renderWithStore(<HQDashboard />, {
      preloadedState: {
        app: {
          activeTab: "hq",
          status: "Ready",
          selectedOutletId: 1,
          toasts: []
        },
        hq: {
          outlets: [{ id: 1, code: "OUTLET01", name: "Central Plaza", location: "Downtown" }],
          menuItems: [],
          revenueByOutlet: [],
          topItems: [],
          isLoading: false,
          currentActionKey: null
        },
        outlet: {
          menu: [],
          inventory: [],
          lastReceipt: "-",
          isLoading: false,
          currentActionKey: null
        }
      }
    });

    await user.click(screen.getByRole("button", { name: "Create Outlet" }));

    expect(screen.getByText("Outlet code is required")).toBeInTheDocument();
    expect(screen.getByText("Outlet name is required")).toBeInTheDocument();
    expect(screen.getByText("Location is required")).toBeInTheDocument();
  });
});
