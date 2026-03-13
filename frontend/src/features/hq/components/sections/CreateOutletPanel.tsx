import { FormEvent, useState } from "react";
import { createOutletThunk } from "../../../../redux/slices/hqSlice";
import { useAppDispatch } from "../../../../redux/hooks";
import { useApiFeedback } from "../../../../shared/hooks/useApiFeedback";
import { FormError } from "../../../../shared/ui/FormError";
import { Panel } from "../../../../shared/ui/Panel";
import { validateWithSchema } from "../../../../shared/validation/validate";
import { outletFormSchema } from "../../validation/hqSchemas";

interface CreateOutletPanelProps {
  isLoading: boolean;
  currentActionKey: string | null;
}

export function CreateOutletPanel({
  isLoading,
  currentActionKey
}: CreateOutletPanelProps) {
  const dispatch = useAppDispatch();
  const { runWithFeedback } = useApiFeedback();
  const [form, setForm] = useState({ code: "", name: "", location: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { errors: validationErrors } = await validateWithSchema(outletFormSchema, form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    await runWithFeedback(async () => {
      await dispatch(createOutletThunk(form)).unwrap();
      setForm({ code: "", name: "", location: "" });
    }, "Outlet created");
  }

  return (
    <Panel title="Create Outlet" subtitle="Register a new outlet under HQ">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          className={`field ${errors.code ? "field-error" : ""}`}
          placeholder="Outlet code"
          value={form.code}
          onChange={(event) => setForm({ ...form, code: event.target.value })}
        />
        <FormError message={errors.code} />

        <input
          className={`field ${errors.name ? "field-error" : ""}`}
          placeholder="Outlet name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
        <FormError message={errors.name} />

        <input
          className={`field ${errors.location ? "field-error" : ""}`}
          placeholder="Location"
          value={form.location}
          onChange={(event) => setForm({ ...form, location: event.target.value })}
        />
        <FormError message={errors.location} />

        <button
          className="btn w-full"
          type="submit"
          disabled={isLoading || currentActionKey === "create-outlet"}
        >
          {currentActionKey === "create-outlet" ? "Creating..." : "Create Outlet"}
        </button>
      </form>
    </Panel>
  );
}
