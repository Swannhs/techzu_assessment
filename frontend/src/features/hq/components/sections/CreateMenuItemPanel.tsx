import { FormEvent, useState } from "react";
import { createMenuItemThunk } from "../../../../redux/slices/hqSlice";
import { useAppDispatch } from "../../../../redux/hooks";
import { useApiFeedback } from "../../../../shared/hooks/useApiFeedback";
import { FormError } from "../../../../shared/ui/FormError";
import { Panel } from "../../../../shared/ui/Panel";
import { validateWithSchema } from "../../../../shared/validation/validate";
import { menuFormSchema } from "../../validation/hqSchemas";

interface CreateMenuItemPanelProps {
  isLoading: boolean;
  currentActionKey: string | null;
}

const initialForm = {
  sku: "",
  name: "",
  description: "",
  basePrice: "0",
  stockDeductionUnits: "1"
};

export function CreateMenuItemPanel({
  isLoading,
  currentActionKey
}: CreateMenuItemPanelProps) {
  const dispatch = useAppDispatch();
  const { runWithFeedback } = useApiFeedback();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { data, errors: validationErrors } = await validateWithSchema(menuFormSchema, {
      ...form,
      basePrice: Number(form.basePrice),
      stockDeductionUnits: Number(form.stockDeductionUnits)
    });

    if (!data) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    await runWithFeedback(async () => {
      await dispatch(createMenuItemThunk(data)).unwrap();
      setForm(initialForm);
    }, "Menu item created");
  }

  return (
    <Panel title="Create Menu Item" subtitle="Add to the HQ master menu">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          className={`field ${errors.sku ? "field-error" : ""}`}
          placeholder="SKU"
          value={form.sku}
          onChange={(event) => setForm({ ...form, sku: event.target.value })}
        />
        <FormError message={errors.sku} />

        <input
          className={`field ${errors.name ? "field-error" : ""}`}
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
        <FormError message={errors.name} />

        <textarea
          className="field min-h-20 resize-y"
          placeholder="Description"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            className={`field ${errors.basePrice ? "field-error" : ""}`}
            type="number"
            step="0.01"
            placeholder="Base price"
            value={form.basePrice}
            onChange={(event) => setForm({ ...form, basePrice: event.target.value })}
          />
          <input
            className={`field ${errors.stockDeductionUnits ? "field-error" : ""}`}
            type="number"
            min="1"
            placeholder="Deduction units"
            value={form.stockDeductionUnits}
            onChange={(event) => setForm({ ...form, stockDeductionUnits: event.target.value })}
          />
        </div>

        <FormError message={errors.basePrice} />
        <FormError message={errors.stockDeductionUnits} />

        <button
          className="btn w-full"
          type="submit"
          disabled={isLoading || currentActionKey === "create-menu-item"}
        >
          {currentActionKey === "create-menu-item" ? "Creating..." : "Create Menu Item"}
        </button>
      </form>
    </Panel>
  );
}
