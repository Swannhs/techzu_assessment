import { useEffect, useState } from "react";
import { apiClient } from "./api/client";
import {
  MenuItem,
  Outlet,
  RevenueByOutletRow,
  TopItemByOutletRow
} from "./api/types";
import { HQPage } from "./pages/hq/HQPage";
import { OutletPage } from "./pages/outlet/OutletPage";

type Tab = "hq" | "outlet";

export function App() {
  const [tab, setTab] = useState<Tab>("hq");
  const [status, setStatus] = useState("Loading...");
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [revenueByOutlet, setRevenueByOutlet] = useState<RevenueByOutletRow[]>([]);
  const [topItems, setTopItems] = useState<TopItemByOutletRow[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<number | null>(null);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    try {
      const [outletResult, menuResult, revenueResult, topItemsResult] = await Promise.all([
        apiClient<Outlet[]>("/hq/outlets"),
        apiClient<MenuItem[]>("/hq/menu-items"),
        apiClient<RevenueByOutletRow[]>("/hq/reports/revenue-by-outlet"),
        apiClient<TopItemByOutletRow[]>("/hq/reports/top-items-by-outlet")
      ]);
      setOutlets(outletResult);
      setMenuItems(menuResult);
      setRevenueByOutlet(revenueResult);
      setTopItems(topItemsResult);
      setSelectedOutletId((current) => current ?? outletResult[0]?.id ?? null);
      setStatus("Ready");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Request failed");
    }
  }

  return (
    <div className="shell">
      <header className="header">
        <h1>F&B HQ System</h1>
        <div className="toolbar">
          <select
            value={selectedOutletId ?? ""}
            onChange={(event) => setSelectedOutletId(Number(event.target.value))}
          >
            {outlets.map((outlet) => (
              <option key={outlet.id} value={outlet.id}>
                {outlet.code} - {outlet.name}
              </option>
            ))}
          </select>
          <button onClick={() => setTab("hq")}>HQ</button>
          <button onClick={() => setTab("outlet")}>Outlet</button>
        </div>
      </header>

      <p className="status">{status}</p>

      {tab === "hq" ? (
        <HQPage
          outlets={outlets}
          menuItems={menuItems}
          revenueByOutlet={revenueByOutlet}
          topItems={topItems}
          selectedOutletId={selectedOutletId}
          onRefresh={refresh}
        />
      ) : (
        <OutletPage outletId={selectedOutletId} statusSetter={setStatus} />
      )}
    </div>
  );
}
