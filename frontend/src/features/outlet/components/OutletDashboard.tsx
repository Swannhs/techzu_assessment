import { FormEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { Panel } from "../../../shared/ui/Panel";
import { FormError } from "../../../shared/ui/FormError";
import { ListSkeleton, LoadingSpinner } from "../../../shared/ui/Loading";
import { useApiFeedback } from "../../../shared/hooks/useApiFeedback";
import { validateWithSchema } from "../../../shared/validation/validate";
import {
  adjustInventoryThunk,
  clearOutletData,
  createSaleThunk,
  loadOutletDataThunk
} from "../../../redux/slices/outletSlice";
import { inventoryFormSchema, saleLineSchema } from "../validation/outletSchemas";

export function OutletDashboard() {
  const dispatch = useAppDispatch();
  const { notifyError, runWithFeedback } = useApiFeedback();
  const { selectedOutletId } = useAppSelector((state) => state.app);
  const isParentLoading = useAppSelector((state) => state.hq.isLoading);
  const { menu, inventory, lastReceipt, isLoading, currentActionKey } = useAppSelector(
    (state) => state.outlet
  );

  const [inventoryForm, setInventoryForm] = useState({
    menuItemId: "",
    quantityDelta: "0",
    reason: ""
  });
  const [saleItems, setSaleItems] = useState([{ menuItemId: "", quantity: "1" }]);
  const [inventoryErrors, setInventoryErrors] = useState<Record<string, string>>({});
  const [saleErrors, setSaleErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!selectedOutletId) {
      dispatch(clearOutletData());
      return;
    }

    void dispatch(loadOutletDataThunk(selectedOutletId))
      .unwrap()
      .catch((error) => notifyError(error));
  }, [dispatch, selectedOutletId]);

  async function handleLoad() {
    if (!selectedOutletId) return;

    await runWithFeedback(async () => {
      await dispatch(loadOutletDataThunk(selectedOutletId)).unwrap();
    }, "Outlet data loaded");
  }

  async function handleAdjustInventory(event: FormEvent) {
    event.preventDefault();
    if (!selectedOutletId) return;

    const { data: normalizedPayload, errors } = await validateWithSchema(inventoryFormSchema, {
      menuItemId: Number(inventoryForm.menuItemId),
      quantityDelta: Number(inventoryForm.quantityDelta),
      reason: inventoryForm.reason
    });
    if (!normalizedPayload) {
      setInventoryErrors(errors);
      return;
    }
    setInventoryErrors({});

    await runWithFeedback(async () => {
      await dispatch(
        adjustInventoryThunk({
          outletId: selectedOutletId,
          menuItemId: normalizedPayload.menuItemId,
          quantityDelta: normalizedPayload.quantityDelta,
          reason: normalizedPayload.reason || undefined
        })
      ).unwrap();
      setInventoryForm({ menuItemId: "", quantityDelta: "0", reason: "" });
      setInventoryErrors({});
    }, "Inventory adjusted");
  }

  async function handleCreateSale(event: FormEvent) {
    event.preventDefault();
    if (!selectedOutletId) return;

    if (saleItems.length === 0) {
      setSaleErrors({ items: "Add at least one item" });
      return;
    }

    const normalizedItems: Array<{ menuItemId: number; quantity: number }> = [];
    const nextErrors: Record<string, string> = {};
    for (let index = 0; index < saleItems.length; index += 1) {
      const item = saleItems[index];
      const { data: validated, errors } = await validateWithSchema(saleLineSchema, {
        menuItemId: Number(item.menuItemId),
        quantity: Number(item.quantity)
      });
      if (validated) {
        normalizedItems.push(validated);
        continue;
      }
      if (errors.menuItemId) nextErrors[`menuItemId-${index}`] = errors.menuItemId;
      if (errors.quantity) nextErrors[`quantity-${index}`] = errors.quantity;
    }

    setSaleErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await runWithFeedback(async () => {
      await dispatch(
        createSaleThunk({
          outletId: selectedOutletId,
          items: normalizedItems
        })
      ).unwrap();
      setSaleItems([{ menuItemId: "", quantity: "1" }]);
      setSaleErrors({});
    }, "Sale created");
  }

  function updateSaleRow(index: number, field: "menuItemId" | "quantity", value: string) {
    setSaleItems((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row))
    );
  }

  function addSaleRow() {
    setSaleItems((current) => [...current, { menuItemId: "", quantity: "1" }]);
  }

  const isBusy = isParentLoading || isLoading;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Outlet Menu" subtitle="Assigned items only">
        <div className="mb-3 flex items-center justify-between">
          <span className="metric-pill">{menu.length} active items</span>
          <button
            className="btn"
            onClick={handleLoad}
            disabled={!selectedOutletId || isBusy}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        {isBusy ? (
          <ListSkeleton rows={4} />
        ) : (
          <div className="space-y-2">
            {menu.map((item) => (
              <div key={item.id} className="list-row">
                <span className="font-semibold">{item.name}</span>
                <span>{item.sku}</span>
                <span className="text-right">${Number(item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Inventory Adjustment">
        <p className="muted mb-3">Adjust local stock quantity for the active outlet.</p>
        <form className="space-y-3" onSubmit={handleAdjustInventory}>
          <select className={`field ${inventoryErrors.menuItemId ? "field-error" : ""}`} value={inventoryForm.menuItemId} onChange={(event) => setInventoryForm({ ...inventoryForm, menuItemId: event.target.value })}>
            <option value="">Select item</option>
            {menu.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <FormError message={inventoryErrors.menuItemId} />
          <input className={`field ${inventoryErrors.quantityDelta ? "field-error" : ""}`} type="number" value={inventoryForm.quantityDelta} onChange={(event) => setInventoryForm({ ...inventoryForm, quantityDelta: event.target.value })} />
          <FormError message={inventoryErrors.quantityDelta} />
          <input className="field" placeholder="Reason" value={inventoryForm.reason} onChange={(event) => setInventoryForm({ ...inventoryForm, reason: event.target.value })} />
          <button
            className="btn w-full"
            type="submit"
            disabled={!selectedOutletId || isBusy || currentActionKey === "adjust-inventory"}
          >
            {currentActionKey === "adjust-inventory" ? "Adjusting..." : "Adjust Inventory"}
          </button>
        </form>

        {isBusy ? (
          <div className="mt-4">
            <ListSkeleton rows={4} />
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {inventory.map((item) => (
              <div key={item.id} className="list-row">
                <span className="font-semibold">{item.menuItem.name}</span>
                <span>{item.menuItem.sku}</span>
                <span className="text-right">{item.stockQuantity}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Create Sale" className="lg:col-span-2">
        <p className="muted mb-3">Create multi-item sales and receive sequential receipt numbers.</p>
        <form className="space-y-3" onSubmit={handleCreateSale}>
          <FormError message={saleErrors.items} />
          {saleItems.map((row, index) => (
            <div className="grid gap-2 sm:grid-cols-[1fr_140px]" key={index}>
              <select
                className={`field ${saleErrors[`menuItemId-${index}`] ? "field-error" : ""}`}
                value={row.menuItemId}
                onChange={(event) => updateSaleRow(index, "menuItemId", event.target.value)}
                disabled={isBusy || currentActionKey === "create-sale"}
              >
                <option value="">Select item</option>
                {menu.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (${Number(item.price).toFixed(2)})
                  </option>
                ))}
              </select>
              <input
                className={`field ${saleErrors[`quantity-${index}`] ? "field-error" : ""}`}
                type="number"
                min="1"
                value={row.quantity}
                onChange={(event) => updateSaleRow(index, "quantity", event.target.value)}
                disabled={isBusy || currentActionKey === "create-sale"}
              />
              <FormError message={saleErrors[`menuItemId-${index}`]} className="sm:col-span-2" />
              <FormError message={saleErrors[`quantity-${index}`]} className="sm:col-span-2" />
            </div>
          ))}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <button
              className="btn-ghost"
              type="button"
              onClick={addSaleRow}
              disabled={isBusy || currentActionKey === "create-sale"}
            >
              Add Item Row
            </button>
            <button
              className="btn"
              type="submit"
              disabled={!selectedOutletId || isBusy || currentActionKey === "create-sale"}
            >
              {currentActionKey === "create-sale" ? "Submitting..." : "Submit Sale"}
            </button>
          </div>
        </form>

        {currentActionKey === "create-sale" ? (
          <div className="mt-4">
            <LoadingSpinner label="Processing sale transaction..." />
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-peach to-[#f7ebdf] px-4 py-3 text-sm text-ink">
          Latest receipt: <span className="font-bold">{lastReceipt}</span>
        </div>
      </Panel>
    </div>
  );
}
