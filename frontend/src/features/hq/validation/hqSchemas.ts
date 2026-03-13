import * as yup from "yup";

export const outletFormSchema = yup.object({
  code: yup.string().trim().required("Outlet code is required"),
  name: yup.string().trim().required("Outlet name is required"),
  location: yup.string().trim().required("Location is required")
});

export const menuFormSchema = yup.object({
  sku: yup.string().trim().required("SKU is required"),
  name: yup.string().trim().required("Name is required"),
  description: yup.string().default(""),
  basePrice: yup
    .number()
    .typeError("Base price must be a number")
    .min(0, "Base price must be 0 or higher")
    .required("Base price is required"),
  stockDeductionUnits: yup
    .number()
    .typeError("Deduction units must be a number")
    .integer("Deduction units must be an integer >= 1")
    .min(1, "Deduction units must be an integer >= 1")
    .required("Deduction units are required")
});

export const assignmentFormSchema = yup.object({
  menuItemId: yup
    .number()
    .typeError("Select a menu item")
    .integer("Select a menu item")
    .min(1, "Select a menu item")
    .required("Select a menu item"),
  priceOverride: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .min(0, "Price override must be 0 or higher")
});

export const editPriceSchema = yup.object({
  basePrice: yup
    .number()
    .typeError("Price must be a number")
    .min(0, "Price must be 0 or higher")
    .required("Price is required")
});
