import { z } from "zod";

export const inventoryAdjustmentSchema = z.object({
  menuItemId: z.coerce.number().int().positive(),
  quantityDelta: z.coerce.number().int(),
  reason: z.string().trim().min(2).max(200).optional()
});

export const createSaleSchema = z.object({
  items: z
    .array(
      z.object({
        menuItemId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive()
      })
    )
    .min(1)
});
