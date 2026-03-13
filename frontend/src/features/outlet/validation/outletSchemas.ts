import * as yup from "yup";

export const inventoryFormSchema = yup.object({
  menuItemId: yup
    .number()
    .typeError("Select an item")
    .integer("Select an item")
    .min(1, "Select an item")
    .required("Select an item"),
  quantityDelta: yup
    .number()
    .typeError("Quantity delta must be a non-zero integer")
    .integer("Quantity delta must be a non-zero integer")
    .notOneOf([0], "Quantity delta must be a non-zero integer")
    .required("Quantity delta is required"),
  reason: yup.string().default("")
});

export const saleLineSchema = yup.object({
  menuItemId: yup
    .number()
    .typeError("Select an item")
    .integer("Select an item")
    .min(1, "Select an item")
    .required("Select an item"),
  quantity: yup
    .number()
    .typeError("Quantity must be an integer >= 1")
    .integer("Quantity must be an integer >= 1")
    .min(1, "Quantity must be an integer >= 1")
    .required("Quantity is required")
});
