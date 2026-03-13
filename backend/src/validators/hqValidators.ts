import { z } from "zod";

export const createOutletSchema = z.object({
  code: z.string().trim().min(2).max(30),
  name: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(200)
});

export const createMenuItemSchema = z.object({
  sku: z.string().trim().min(2).max(30),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  basePrice: z.coerce.number().nonnegative(),
  stockDeductionUnits: z.coerce.number().int().positive(),
  isActive: z.boolean().optional().default(true)
});

export const updateMenuItemSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(500).optional().nullable(),
    basePrice: z.coerce.number().nonnegative().optional(),
    stockDeductionUnits: z.coerce.number().int().positive().optional(),
    isActive: z.boolean().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one update field is required"
  });

export const assignMenuItemSchema = z.object({
  menuItemId: z.coerce.number().int().positive(),
  priceOverride: z.coerce.number().nonnegative().optional().nullable(),
  isActive: z.boolean().optional().default(true)
});

export const updateOutletAssignmentSchema = z
  .object({
    priceOverride: z.coerce.number().nonnegative().optional().nullable(),
    isActive: z.boolean().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one update field is required"
  });

export const topItemsReportQuerySchema = z.object({
  outletId: z.coerce.number().int().positive().optional()
});

export type CreateOutletInput = z.infer<typeof createOutletSchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type AssignMenuItemInput = z.infer<typeof assignMenuItemSchema>;
export type UpdateOutletAssignmentInput = z.infer<typeof updateOutletAssignmentSchema>;
export type TopItemsReportQuery = z.infer<typeof topItemsReportQuerySchema>;
