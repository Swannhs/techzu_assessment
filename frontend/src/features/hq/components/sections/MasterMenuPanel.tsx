import { useState } from "react";
import { MenuItem } from "../../../../lib/api/types";
import { useAppDispatch } from "../../../../redux/hooks";
import {
  toggleMenuItemThunk,
  updateMenuItemPriceThunk
} from "../../../../redux/slices/hqSlice";
import { useApiFeedback } from "../../../../shared/hooks/useApiFeedback";
import { FormError } from "../../../../shared/ui/FormError";
import { ListSkeleton } from "../../../../shared/ui/Loading";
import { Panel } from "../../../../shared/ui/Panel";
import { validateWithSchema } from "../../../../shared/validation/validate";
import { editPriceSchema } from "../../validation/hqSchemas";

interface MasterMenuPanelProps {
  menuItems: MenuItem[];
  isLoading: boolean;
  currentActionKey: string | null;
}

export function MasterMenuPanel({
  menuItems,
  isLoading,
  currentActionKey
}: MasterMenuPanelProps) {
  const dispatch = useAppDispatch();
  const { runWithFeedback } = useApiFeedback();
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState("");
  const [priceEditError, setPriceEditError] = useState("");

  async function toggleMenu(menuItemId: number, nextIsActive: boolean) {
    const actionKey = `toggle-menu-${menuItemId}`;
    const message = `Menu ${nextIsActive ? "activated" : "deactivated"}`;

    await runWithFeedback(async () => {
      await dispatch(toggleMenuItemThunk({ menuItemId, isActive: nextIsActive, actionKey })).unwrap();
    }, message);
  }

  async function savePrice(menuItemId: number, fallbackPrice: string) {
    const actionKey = `save-price-${menuItemId}`;
    const { data, errors } = await validateWithSchema(editPriceSchema, {
      basePrice: Number(editingPrice || fallbackPrice)
    });

    if (!data) {
      setPriceEditError(errors.basePrice ?? "Invalid price");
      return;
    }

    setPriceEditError("");

    await runWithFeedback(async () => {
      await dispatch(
        updateMenuItemPriceThunk({
          menuItemId,
          basePrice: data.basePrice,
          actionKey
        })
      ).unwrap();

      setEditingMenuId(null);
      setEditingPrice("");
    }, "Menu price updated");
  }

  function startEditing(item: MenuItem) {
    setEditingMenuId(item.id);
    setEditingPrice(item.basePrice);
    setPriceEditError("");
  }

  return (
    <Panel title="Master Menu" className="lg:col-span-2">
      <div className="mb-3 flex items-center justify-between">
        <span className="metric-pill">{menuItems.length} menu items</span>
      </div>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : (
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isEditing = editingMenuId === item.id;
            const isSavingPrice = currentActionKey === `save-price-${item.id}`;
            const isToggling = currentActionKey === `toggle-menu-${item.id}`;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-moss/10 bg-gradient-to-r from-white to-[#f8fbf9] p-3"
              >
                <div className="grid gap-2 lg:grid-cols-[1.2fr_1.4fr_0.8fr_auto_auto] lg:items-center">
                  <span className="font-semibold">{item.sku}</span>
                  <span>{item.name}</span>
                  <span className={item.isActive ? "text-emerald-700" : "text-amber-700"}>
                    {item.isActive ? "Active" : "Inactive"}
                  </span>

                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        className={`field h-9 max-w-28 ${priceEditError ? "field-error" : ""}`}
                        type="number"
                        step="0.01"
                        value={editingPrice}
                        onChange={(event) => setEditingPrice(event.target.value)}
                      />
                      <button
                        className="btn h-9 px-3"
                        onClick={() => savePrice(item.id, item.basePrice)}
                        disabled={isLoading || isSavingPrice}
                      >
                        {isSavingPrice ? "Saving..." : "Save"}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-ghost h-9 px-3"
                      onClick={() => startEditing(item)}
                      disabled={isLoading}
                    >
                      Edit Price
                    </button>
                  )}

                  <button
                    className="btn-ghost h-9 px-3"
                    onClick={() => toggleMenu(item.id, !item.isActive)}
                    disabled={isLoading || isToggling}
                  >
                    {isToggling ? "Updating..." : item.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>

                <FormError message={isEditing ? priceEditError : undefined} className="mt-2" />
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
