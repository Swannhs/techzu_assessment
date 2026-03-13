import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MasterMenuPanel } from "../src/features/hq/components/sections/MasterMenuPanel";
import { renderWithStore } from "./renderWithStore";

describe("MasterMenuPanel", () => {
  it("opens inline price editing for a menu item", async () => {
    const user = userEvent.setup();

    renderWithStore(
      <MasterMenuPanel
        menuItems={[
          {
            id: 1,
            sku: "BRG-001",
            name: "Classic Burger",
            description: "Beef burger",
            basePrice: "12.50",
            stockDeductionUnits: 1,
            isActive: true
          }
        ]}
        isLoading={false}
        currentActionKey={null}
      />
    );

    await user.click(screen.getByRole("button", { name: "Edit Price" }));

    expect(screen.getByDisplayValue("12.50")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});
