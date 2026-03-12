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
