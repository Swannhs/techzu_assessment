import { FormEvent, useState } from "react";
import { apiClient } from "../../api/client";

interface OutletMenuItem {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: string;
  stockDeductionUnits: number;
}

interface InventoryItem {
  id: number;
  menuItemId: number;
  stockQuantity: number;
  menuItem: {
    id: number;
    name: string;
    sku: string;
  };
}

interface OutletPageProps {
  outletId: number | null;
  statusSetter: (value: string) => void;
}

export function OutletPage({ outletId, statusSetter }: OutletPageProps) {
  const [menu, setMenu] = useState<OutletMenuItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryForm, setInventoryForm] = useState({
    menuItemId: "",
    quantityDelta: "0",
    reason: ""
  });
  const [saleItems, setSaleItems] = useState([{ menuItemId: "", quantity: "1" }]);
  const [lastReceipt, setLastReceipt] = useState<string>("-");

  async function refreshOutletData() {
    if (!outletId) return;
    const [menuResult, inventoryResult] = await Promise.all([
      apiClient<OutletMenuItem[]>(`/outlets/${outletId}/menu`),
      apiClient<InventoryItem[]>(`/outlets/${outletId}/inventory`)
    ]);
    setMenu(menuResult);
    setInventory(inventoryResult);
  }

  async function handleLoad() {
    try {
      await refreshOutletData();
      statusSetter("Outlet data loaded");
    } catch (error) {
      statusSetter(error instanceof Error ? error.message : "Request failed");
    }
  }

  async function handleAdjustInventory(event: FormEvent) {
    event.preventDefault();
    if (!outletId) return;
    try {
      await apiClient(`/outlets/${outletId}/inventory/adjust`, {
        method: "POST",
        body: JSON.stringify({
          menuItemId: Number(inventoryForm.menuItemId),
          quantityDelta: Number(inventoryForm.quantityDelta),
          reason: inventoryForm.reason
        })
      });
      setInventoryForm({ menuItemId: "", quantityDelta: "0", reason: "" });
      await refreshOutletData();
      statusSetter("Inventory adjusted");
    } catch (error) {
      statusSetter(error instanceof Error ? error.message : "Request failed");
    }
  }

  async function handleCreateSale(event: FormEvent) {
    event.preventDefault();
    if (!outletId) return;
    try {
      const sale = await apiClient<{ receiptNumber: string }>(`/outlets/${outletId}/sales`, {
        method: "POST",
        body: JSON.stringify({
          items: saleItems.map((item) => ({
            menuItemId: Number(item.menuItemId),
            quantity: Number(item.quantity)
          }))
        })
      });
      setLastReceipt(sale.receiptNumber);
      setSaleItems([{ menuItemId: "", quantity: "1" }]);
      await refreshOutletData();
      statusSetter(`Sale created: ${sale.receiptNumber}`);
    } catch (error) {
      statusSetter(error instanceof Error ? error.message : "Request failed");
    }
  }

  function updateSaleRow(index: number, field: "menuItemId" | "quantity", value: string) {
    setSaleItems((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row))
    );
  }

  function addSaleRow() {
    setSaleItems((current) => [...current, { menuItemId: "", quantity: "1" }]);
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Outlet Menu</h2>
        <button onClick={handleLoad} disabled={!outletId}>
          Load Outlet Data
        </button>
        <ul className="list">
          {menu.map((item) => (
            <li key={item.id}>
              <strong>{item.name}</strong>
              <span>{item.sku}</span>
              <span>${Number(item.price).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Inventory</h2>
        <form className="stack" onSubmit={handleAdjustInventory}>
          <select
            value={inventoryForm.menuItemId}
            onChange={(event) =>
              setInventoryForm({ ...inventoryForm, menuItemId: event.target.value })
            }
          >
            <option value="">Select item</option>
            {menu.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={inventoryForm.quantityDelta}
            onChange={(event) =>
              setInventoryForm({ ...inventoryForm, quantityDelta: event.target.value })
            }
          />
          <input
            placeholder="Reason"
            value={inventoryForm.reason}
            onChange={(event) =>
              setInventoryForm({ ...inventoryForm, reason: event.target.value })
            }
          />
          <button type="submit" disabled={!outletId}>
            Adjust Inventory
          </button>
        </form>
        <ul className="list">
          {inventory.map((item) => (
            <li key={item.id}>
              <strong>{item.menuItem.name}</strong>
              <span>{item.stockQuantity}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card wide">
        <h2>Sales</h2>
        <form className="stack" onSubmit={handleCreateSale}>
          {saleItems.map((row, index) => (
            <div className="row" key={index}>
              <select
                value={row.menuItemId}
                onChange={(event) => updateSaleRow(index, "menuItemId", event.target.value)}
              >
                <option value="">Select item</option>
                {menu.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (${Number(item.price).toFixed(2)})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={row.quantity}
                onChange={(event) => updateSaleRow(index, "quantity", event.target.value)}
              />
            </div>
          ))}
          <div className="toolbar">
            <button type="button" onClick={addSaleRow}>
              Add Item
            </button>
            <button type="submit" disabled={!outletId}>
              Create Sale
            </button>
          </div>
        </form>
        <p>Latest receipt: {lastReceipt}</p>
      </section>
    </div>
  );
}
