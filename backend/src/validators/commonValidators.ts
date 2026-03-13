import { z } from "zod";

export const outletIdParamSchema = z.object({
  outletId: z.coerce.number().int().positive()
});

export const menuItemIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const outletMenuItemParamSchema = z.object({
  outletId: z.coerce.number().int().positive(),
  menuItemId: z.coerce.number().int().positive()
});

export type OutletIdParams = z.infer<typeof outletIdParamSchema>;
export type MenuItemIdParams = z.infer<typeof menuItemIdParamSchema>;
export type OutletMenuItemParams = z.infer<typeof outletMenuItemParamSchema>;
