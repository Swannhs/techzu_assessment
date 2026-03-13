import { hqRoutes } from "../../src/routes/hqRoutes.js";
import { outletRoutes } from "../../src/routes/outletRoutes.js";

function extractRoutes(router: any) {
  return router.stack
    .filter((layer: any) => layer.route)
    .map((layer: any) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods).sort(),
      middlewareCount: layer.route.stack.length
    }));
}

describe("API route definitions", () => {
  it("registers HQ endpoints with middleware stack", () => {
    const routes = extractRoutes(hqRoutes);

    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "/outlets", methods: ["post"], middlewareCount: 2 }),
        expect.objectContaining({ path: "/outlets", methods: ["get"], middlewareCount: 1 }),
        expect.objectContaining({ path: "/menu-items", methods: ["post"], middlewareCount: 2 }),
        expect.objectContaining({ path: "/menu-items", methods: ["get"], middlewareCount: 1 }),
        expect.objectContaining({ path: "/menu-items/:id", methods: ["get"], middlewareCount: 2 }),
        expect.objectContaining({ path: "/menu-items/:id", methods: ["put"], middlewareCount: 2 }),
        expect.objectContaining({
          path: "/outlets/:outletId/menu-items",
          methods: ["post"],
          middlewareCount: 2
        }),
        expect.objectContaining({
          path: "/outlets/:outletId/menu-items/:menuItemId",
          methods: ["put"],
          middlewareCount: 2
        }),
        expect.objectContaining({
          path: "/reports/revenue-by-outlet",
          methods: ["get"],
          middlewareCount: 1
        }),
        expect.objectContaining({
          path: "/reports/top-items-by-outlet",
          methods: ["get"],
          middlewareCount: 2
        })
      ])
    );
  });

  it("registers outlet endpoints with validation middleware", () => {
    const routes = extractRoutes(outletRoutes);

    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "/:outletId/menu", methods: ["get"], middlewareCount: 2 }),
        expect.objectContaining({
          path: "/:outletId/inventory",
          methods: ["get"],
          middlewareCount: 2
        }),
        expect.objectContaining({
          path: "/:outletId/inventory/adjust",
          methods: ["post"],
          middlewareCount: 2
        }),
        expect.objectContaining({
          path: "/:outletId/sales",
          methods: ["post"],
          middlewareCount: 2
        })
      ])
    );
  });
});
