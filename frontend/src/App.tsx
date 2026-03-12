import { useEffect, useState } from "react";
import { apiClient } from "./api/client";
import { MenuItem, Outlet } from "./api/types";
import { HQPage } from "./pages/hq/HQPage";

type Tab = "hq" | "outlet";

export function App() {
  const [tab, setTab] = useState<Tab>("hq");
  const [status, setStatus] = useState("Loading...");
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<number | null>(null);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    try {
      const [outletResult, menuResult] = await Promise.all([
        apiClient<Outlet[]>("/hq/outlets"),
        apiClient<MenuItem[]>("/hq/menu-items")
      ]);
      setOutlets(outletResult);
      setMenuItems(menuResult);
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
          selectedOutletId={selectedOutletId}
          onRefresh={refresh}
        />
      ) : (
        <div className="card">Outlet screens coming in next commit.</div>
      )}
    </div>
  );
}
