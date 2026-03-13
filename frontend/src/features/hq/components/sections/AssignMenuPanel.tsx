import { FormEvent, useState } from "react";
import { Outlet, MenuItem } from "../../../../lib/api/types";
import { useAppDispatch } from "../../../../redux/hooks";
import { assignMenuToOutletThunk } from "../../../../redux/slices/hqSlice";
import { useApiFeedback } from "../../../../shared/hooks/useApiFeedback";
import { FormError } from "../../../../shared/ui/FormError";
import { Panel } from "../../../../shared/ui/Panel";
import { validateWithSchema } from "../../../../shared/validation/validate";
import { assignmentFormSchema } from "../../validation/hqSchemas";

interface AssignMenuPanelProps {
  outlets: Outlet[];
  menuItems: MenuItem[];
  selectedOutletId: number | null;
  isLoading: boolean;
  currentActionKey: string | null;
}

export function AssignMenuPanel({
  outlets,
  menuItems,
  selectedOutletId,
  isLoading,
  currentActionKey
}: AssignMenuPanelProps) {
  const dispatch = useAppDispatch();
  const { runWithFeedback } = useApiFeedback();
  const [form, setForm] = useState({ menuItemId: "", priceOverride: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!selectedOutletId) {
      setErrors({ outlet: "Select an outlet first" });
      return;
    }

    const { data, errors: validationErrors } = await validateWithSchema(assignmentFormSchema, {
      menuItemId: Number(form.menuItemId),
      priceOverride: form.priceOverride
    });

    if (!data) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    await runWithFeedback(async () => {
      await dispatch(
        assignMenuToOutletThunk({
          outletId: selectedOutletId,
          menuItemId: data.menuItemId,
          priceOverride: data.priceOverride ?? null
        })
      ).unwrap();

      setForm({ menuItemId: "", priceOverride: "" });
    }, "Menu assigned to outlet");
  }

  const activeOutletName = selectedOutletId
    ? outlets.find((item) => item.id === selectedOutletId)?.name
    : "Select outlet in header";

  return (
    <Panel title="Assign Menu to Outlet" subtitle="Set optional outlet-specific price">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="rounded-xl border border-moss/15 bg-mist px-3 py-2 text-sm text-moss/80">
          Active outlet: {activeOutletName}
        </div>
        <FormError message={errors.outlet} />

        <select
          className={`field ${errors.menuItemId ? "field-error" : ""}`}
          value={form.menuItemId}
          onChange={(event) => setForm({ ...form, menuItemId: event.target.value })}
        >
          <option value="">Select menu item</option>
          {menuItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.sku} - {item.name}
            </option>
          ))}
        </select>
        <FormError message={errors.menuItemId} />

        <input
          className={`field ${errors.priceOverride ? "field-error" : ""}`}
          type="number"
          step="0.01"
          placeholder="Price override"
          value={form.priceOverride}
          onChange={(event) => setForm({ ...form, priceOverride: event.target.value })}
        />
        <FormError message={errors.priceOverride} />

        <button
          className="btn w-full"
          type="submit"
          disabled={!selectedOutletId || isLoading || currentActionKey === "assign-menu-item"}
        >
          {currentActionKey === "assign-menu-item" ? "Assigning..." : "Assign Menu"}
        </button>
      </form>
    </Panel>
  );
}
