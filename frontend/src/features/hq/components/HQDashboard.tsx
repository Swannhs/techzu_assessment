import { FormEvent, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { Panel } from "../../../shared/ui/Panel";
import { FormError } from "../../../shared/ui/FormError";
import { ListSkeleton, LoadingSpinner } from "../../../shared/ui/Loading";
import { useApiFeedback } from "../../../shared/hooks/useApiFeedback";
import { validateWithSchema } from "../../../shared/validation/validate";
import {
  assignMenuToOutletThunk,
  createMenuItemThunk,
  createOutletThunk,
  toggleMenuItemThunk,
  updateMenuItemPriceThunk
} from "../../../redux/slices/hqSlice";
import {
  assignmentFormSchema,
  editPriceSchema,
  menuFormSchema,
  outletFormSchema
} from "../validation/hqSchemas";

export function HQDashboard() {
  const dispatch = useAppDispatch();
  const { runWithFeedback } = useApiFeedback();
  const { selectedOutletId } = useAppSelector((state) => state.app);
  const { outlets, menuItems, revenueByOutlet, topItems, isLoading, currentActionKey } =
    useAppSelector((state) => state.hq);

  const [outletForm, setOutletForm] = useState({ code: "", name: "", location: "" });
  const [menuForm, setMenuForm] = useState({
    sku: "",
    name: "",
    description: "",
    basePrice: "0",
    stockDeductionUnits: "1"
  });
  const [assignmentForm, setAssignmentForm] = useState({ menuItemId: "", priceOverride: "" });
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState("");
  const [outletErrors, setOutletErrors] = useState<Record<string, string>>({});
  const [menuErrors, setMenuErrors] = useState<Record<string, string>>({});
  const [assignmentErrors, setAssignmentErrors] = useState<Record<string, string>>({});
  const [priceEditError, setPriceEditError] = useState("");

  async function handleCreateOutlet(event: FormEvent) {
    event.preventDefault();
    const { errors } = await validateWithSchema(outletFormSchema, outletForm);
    if (Object.keys(errors).length > 0) {
      setOutletErrors(errors);
      return;
    }
    setOutletErrors({});

    await runWithFeedback(async () => {
      await dispatch(createOutletThunk(outletForm)).unwrap();
      setOutletForm({ code: "", name: "", location: "" });
      setOutletErrors({});
    }, "Outlet created");
  }

  async function handleCreateMenu(event: FormEvent) {
    event.preventDefault();

    const { data: normalizedPayload, errors } = await validateWithSchema(menuFormSchema, {
      ...menuForm,
      basePrice: Number(menuForm.basePrice),
      stockDeductionUnits: Number(menuForm.stockDeductionUnits)
    });
    if (!normalizedPayload) {
      setMenuErrors(errors);
      return;
    }
    setMenuErrors({});

    await runWithFeedback(async () => {
      await dispatch(createMenuItemThunk(normalizedPayload)).unwrap();
      setMenuForm({
        sku: "",
        name: "",
        description: "",
        basePrice: "0",
        stockDeductionUnits: "1"
      });
      setMenuErrors({});
    }, "Menu item created");
  }

  async function handleAssignMenu(event: FormEvent) {
    event.preventDefault();
    if (!selectedOutletId) {
      setAssignmentErrors({ outlet: "Select an outlet first" });
      return;
    }

    const { data: normalizedPayload, errors } = await validateWithSchema(assignmentFormSchema, {
      menuItemId: Number(assignmentForm.menuItemId),
      priceOverride: assignmentForm.priceOverride
    });
    if (!normalizedPayload) {
      setAssignmentErrors(errors);
      return;
    }
    setAssignmentErrors({});

    await runWithFeedback(async () => {
      await dispatch(
        assignMenuToOutletThunk({
          outletId: selectedOutletId,
          menuItemId: normalizedPayload.menuItemId,
          priceOverride: normalizedPayload.priceOverride ?? null
        })
      ).unwrap();
      setAssignmentForm({ menuItemId: "", priceOverride: "" });
      setAssignmentErrors({});
    }, "Menu assigned to outlet");
  }

  async function toggleMenu(menuItemId: number, nextIsActive: boolean) {
    const actionKey = `toggle-menu-${menuItemId}`;
    const message = `Menu ${nextIsActive ? "activated" : "deactivated"}`;
    await runWithFeedback(async () => {
      await dispatch(toggleMenuItemThunk({ menuItemId, isActive: nextIsActive, actionKey })).unwrap();
    }, message);
  }

  async function savePrice(menuItemId: number, fallbackPrice: string) {
    const actionKey = `save-price-${menuItemId}`;

    const { data: parsedData, errors } = await validateWithSchema(editPriceSchema, {
      basePrice: Number(editingPrice || fallbackPrice)
    });
    if (!parsedData) {
      setPriceEditError(errors.basePrice ?? "Invalid price");
      return;
    }
    const nextPrice = parsedData.basePrice;
    setPriceEditError("");

    await runWithFeedback(async () => {
      await dispatch(
        updateMenuItemPriceThunk({
          menuItemId,
          basePrice: nextPrice,
          actionKey
        })
      ).unwrap();
      setEditingMenuId(null);
    }, "Menu price updated");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <Panel title="Create Outlet" subtitle="Register a new outlet under HQ">
        <form className="space-y-3" onSubmit={handleCreateOutlet}>
          <input className={`field ${outletErrors.code ? "field-error" : ""}`} placeholder="Outlet code" value={outletForm.code} onChange={(event) => setOutletForm({ ...outletForm, code: event.target.value })} />
          <FormError message={outletErrors.code} />
          <input className={`field ${outletErrors.name ? "field-error" : ""}`} placeholder="Outlet name" value={outletForm.name} onChange={(event) => setOutletForm({ ...outletForm, name: event.target.value })} />
          <FormError message={outletErrors.name} />
          <input className={`field ${outletErrors.location ? "field-error" : ""}`} placeholder="Location" value={outletForm.location} onChange={(event) => setOutletForm({ ...outletForm, location: event.target.value })} />
          <FormError message={outletErrors.location} />
          <button className="btn w-full" type="submit" disabled={isLoading || currentActionKey === "create-outlet"}>
            {currentActionKey === "create-outlet" ? "Creating..." : "Create Outlet"}
          </button>
        </form>
      </Panel>

      <Panel title="Create Menu Item" subtitle="Add to the HQ master menu">
        <form className="space-y-3" onSubmit={handleCreateMenu}>
          <input className={`field ${menuErrors.sku ? "field-error" : ""}`} placeholder="SKU" value={menuForm.sku} onChange={(event) => setMenuForm({ ...menuForm, sku: event.target.value })} />
          <FormError message={menuErrors.sku} />
          <input className={`field ${menuErrors.name ? "field-error" : ""}`} placeholder="Name" value={menuForm.name} onChange={(event) => setMenuForm({ ...menuForm, name: event.target.value })} />
          <FormError message={menuErrors.name} />
          <textarea className="field min-h-20 resize-y" placeholder="Description" value={menuForm.description} onChange={(event) => setMenuForm({ ...menuForm, description: event.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className={`field ${menuErrors.basePrice ? "field-error" : ""}`} type="number" step="0.01" placeholder="Base price" value={menuForm.basePrice} onChange={(event) => setMenuForm({ ...menuForm, basePrice: event.target.value })} />
            <input className={`field ${menuErrors.stockDeductionUnits ? "field-error" : ""}`} type="number" min="1" placeholder="Deduction units" value={menuForm.stockDeductionUnits} onChange={(event) => setMenuForm({ ...menuForm, stockDeductionUnits: event.target.value })} />
          </div>
          <FormError message={menuErrors.basePrice} />
          <FormError message={menuErrors.stockDeductionUnits} />
          <button className="btn w-full" type="submit" disabled={isLoading || currentActionKey === "create-menu-item"}>
            {currentActionKey === "create-menu-item" ? "Creating..." : "Create Menu Item"}
          </button>
        </form>
      </Panel>

      <Panel title="Assign Menu to Outlet" subtitle="Set optional outlet-specific price">
        <form className="space-y-3" onSubmit={handleAssignMenu}>
          <div className="rounded-xl border border-moss/15 bg-mist px-3 py-2 text-sm text-moss/80">
            Active outlet:{" "}
            {selectedOutletId
              ? outlets.find((item) => item.id === selectedOutletId)?.name
              : "Select outlet in header"}
          </div>
          <FormError message={assignmentErrors.outlet} />
          <select className={`field ${assignmentErrors.menuItemId ? "field-error" : ""}`} value={assignmentForm.menuItemId} onChange={(event) => setAssignmentForm({ ...assignmentForm, menuItemId: event.target.value })}>
            <option value="">Select menu item</option>
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.sku} - {item.name}
              </option>
            ))}
          </select>
          <FormError message={assignmentErrors.menuItemId} />
          <input className={`field ${assignmentErrors.priceOverride ? "field-error" : ""}`} type="number" step="0.01" placeholder="Price override" value={assignmentForm.priceOverride} onChange={(event) => setAssignmentForm({ ...assignmentForm, priceOverride: event.target.value })} />
          <FormError message={assignmentErrors.priceOverride} />
          <button
            className="btn w-full"
            type="submit"
            disabled={!selectedOutletId || isLoading || currentActionKey === "assign-menu-item"}
          >
            {currentActionKey === "assign-menu-item" ? "Assigning..." : "Assign Menu"}
          </button>
        </form>
      </Panel>

      <Panel title="Outlets" className="xl:col-span-1">
        <div className="mb-3 flex items-center justify-between">
          <span className="metric-pill">{outlets.length} total outlets</span>
        </div>
        {isLoading ? (
          <ListSkeleton rows={4} />
        ) : (
          <div className="space-y-2">
            {outlets.map((outlet) => (
              <div key={outlet.id} className="list-row">
                <span className="font-semibold text-ink">{outlet.code}</span>
                <span>{outlet.name}</span>
                <span className="text-moss/70">{outlet.location}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Master Menu" className="lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <span className="metric-pill">{menuItems.length} menu items</span>
        </div>
        {isLoading ? (
          <ListSkeleton rows={6} />
        ) : (
          <div className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-moss/10 bg-gradient-to-r from-white to-[#f8fbf9] p-3">
                <div className="grid gap-2 lg:grid-cols-[1.2fr_1.4fr_0.8fr_auto_auto] lg:items-center">
                  <span className="font-semibold">{item.sku}</span>
                  <span>{item.name}</span>
                  <span className={item.isActive ? "text-emerald-700" : "text-amber-700"}>
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                  {editingMenuId === item.id ? (
                    <div className="flex gap-2">
                      <input className={`field h-9 max-w-28 ${priceEditError ? "field-error" : ""}`} type="number" step="0.01" value={editingPrice} onChange={(event) => setEditingPrice(event.target.value)} />
                      <button className="btn h-9 px-3" onClick={() => savePrice(item.id, item.basePrice)} disabled={isLoading || currentActionKey === `save-price-${item.id}`}>
                        {currentActionKey === `save-price-${item.id}` ? "Saving..." : "Save"}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-ghost h-9 px-3"
                      onClick={() => {
                        setEditingMenuId(item.id);
                        setEditingPrice(item.basePrice);
                      }}
                      disabled={isLoading}
                    >
                      Edit Price
                    </button>
                  )}
                  <button
                    className="btn-ghost h-9 px-3"
                    onClick={() => toggleMenu(item.id, !item.isActive)}
                    disabled={isLoading || currentActionKey === `toggle-menu-${item.id}`}
                  >
                    {currentActionKey === `toggle-menu-${item.id}` ? "Updating..." : item.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
                <FormError message={editingMenuId === item.id ? priceEditError : undefined} className="mt-2" />
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Revenue by Outlet">
        <div className="mb-3 flex items-center justify-between">
          <span className="metric-pill">HQ Revenue Snapshot</span>
        </div>
        {isLoading ? (
          <LoadingSpinner label="Refreshing revenue..." />
        ) : (
          <div className="space-y-2">
            {revenueByOutlet.map((row) => (
              <div key={row.outletId} className="list-row">
                <span className="font-semibold">{row.outletCode}</span>
                <span>{row.outletName}</span>
                <span className="text-right font-semibold text-moss">${Number(row.totalRevenue).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Top Selling Items by Outlet" className="lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <span className="metric-pill">Top 5 per outlet</span>
        </div>
        {isLoading ? (
          <LoadingSpinner label="Refreshing top items..." />
        ) : (
          <div className="space-y-2">
            {topItems.map((row, index) => (
              <div key={`${row.outletId}-${row.menuItemId}-${index}`} className="list-row">
                <span className="font-semibold">{row.outletCode}</span>
                <span>{row.itemName}</span>
                <span className="text-right">{row.totalQuantity} sold</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
