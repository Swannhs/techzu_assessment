import { FormEvent, useState } from "react";
import { apiClient } from "../../api/client";
import {
  MenuItem,
  Outlet,
  RevenueByOutletRow,
  TopItemByOutletRow
} from "../../api/types";

interface HQPageProps {
  outlets: Outlet[];
  menuItems: MenuItem[];
  revenueByOutlet: RevenueByOutletRow[];
  topItems: TopItemByOutletRow[];
  selectedOutletId: number | null;
  onRefresh: () => Promise<void>;
}

export function HQPage({
  outlets,
  menuItems,
  revenueByOutlet,
  topItems,
  selectedOutletId,
  onRefresh
}: HQPageProps) {
  const [outletForm, setOutletForm] = useState({ code: "", name: "", location: "" });
  const [menuForm, setMenuForm] = useState({
    sku: "",
    name: "",
    description: "",
    basePrice: "0",
    stockDeductionUnits: "1"
  });
  const [assignmentForm, setAssignmentForm] = useState({
    menuItemId: "",
    priceOverride: ""
  });
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState("");

  async function handleCreateOutlet(event: FormEvent) {
    event.preventDefault();
    await apiClient("/hq/outlets", {
      method: "POST",
      body: JSON.stringify(outletForm)
    });
    setOutletForm({ code: "", name: "", location: "" });
    await onRefresh();
  }

  async function handleCreateMenu(event: FormEvent) {
    event.preventDefault();
    await apiClient("/hq/menu-items", {
      method: "POST",
      body: JSON.stringify({
        ...menuForm,
        basePrice: Number(menuForm.basePrice),
        stockDeductionUnits: Number(menuForm.stockDeductionUnits),
        isActive: true
      })
    });
    setMenuForm({
      sku: "",
      name: "",
      description: "",
      basePrice: "0",
      stockDeductionUnits: "1"
    });
    await onRefresh();
  }

  async function handleAssignMenu(event: FormEvent) {
    event.preventDefault();
    if (!selectedOutletId) return;

    await apiClient(`/hq/outlets/${selectedOutletId}/menu-items`, {
      method: "POST",
      body: JSON.stringify({
        menuItemId: Number(assignmentForm.menuItemId),
        priceOverride:
          assignmentForm.priceOverride === "" ? null : Number(assignmentForm.priceOverride),
        isActive: true
      })
    });

    setAssignmentForm({ menuItemId: "", priceOverride: "" });
    await onRefresh();
  }

  async function toggleMenuActive(item: MenuItem) {
    await apiClient(`/hq/menu-items/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({
        isActive: !item.isActive
      })
    });
    await onRefresh();
  }

  async function updateMenuPrice(item: MenuItem, newPrice: string) {
    await apiClient(`/hq/menu-items/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({
        basePrice: Number(newPrice)
      })
    });
    setEditingMenuId(null);
    await onRefresh();
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Create Outlet</h2>
        <form className="stack" onSubmit={handleCreateOutlet}>
          <input
            placeholder="Code"
            value={outletForm.code}
            onChange={(event) => setOutletForm({ ...outletForm, code: event.target.value })}
          />
          <input
            placeholder="Name"
            value={outletForm.name}
            onChange={(event) => setOutletForm({ ...outletForm, name: event.target.value })}
          />
          <input
            placeholder="Location"
            value={outletForm.location}
            onChange={(event) =>
              setOutletForm({ ...outletForm, location: event.target.value })
            }
          />
          <button type="submit">Create Outlet</button>
        </form>
      </section>

      <section className="card">
        <h2>Create Menu Item</h2>
        <form className="stack" onSubmit={handleCreateMenu}>
          <input
            placeholder="SKU"
            value={menuForm.sku}
            onChange={(event) => setMenuForm({ ...menuForm, sku: event.target.value })}
          />
          <input
            placeholder="Name"
            value={menuForm.name}
            onChange={(event) => setMenuForm({ ...menuForm, name: event.target.value })}
          />
          <input
            placeholder="Description"
            value={menuForm.description}
            onChange={(event) =>
              setMenuForm({ ...menuForm, description: event.target.value })
            }
          />
          <input
            type="number"
            step="0.01"
            placeholder="Base Price"
            value={menuForm.basePrice}
            onChange={(event) => setMenuForm({ ...menuForm, basePrice: event.target.value })}
          />
          <input
            type="number"
            min="1"
            placeholder="Stock Deduction Units"
            value={menuForm.stockDeductionUnits}
            onChange={(event) =>
              setMenuForm({ ...menuForm, stockDeductionUnits: event.target.value })
            }
          />
          <button type="submit">Create Menu Item</button>
        </form>
      </section>

      <section className="card">
        <h2>Assign Menu to Outlet</h2>
        <form className="stack" onSubmit={handleAssignMenu}>
          <p>
            Active outlet:{" "}
            {selectedOutletId
              ? outlets.find((item) => item.id === selectedOutletId)?.name
              : "Select outlet"}
          </p>
          <select
            value={assignmentForm.menuItemId}
            onChange={(event) =>
              setAssignmentForm({ ...assignmentForm, menuItemId: event.target.value })
            }
          >
            <option value="">Select menu item</option>
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.sku} - {item.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Price override"
            value={assignmentForm.priceOverride}
            onChange={(event) =>
              setAssignmentForm({ ...assignmentForm, priceOverride: event.target.value })
            }
          />
          <button type="submit" disabled={!selectedOutletId}>
            Assign Menu
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Outlets</h2>
        <ul className="list">
          {outlets.map((outlet) => (
            <li key={outlet.id}>
              <strong>{outlet.code}</strong>
              <span>{outlet.name}</span>
              <span>{outlet.location}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card wide">
        <h2>Master Menu</h2>
        <ul className="list">
          {menuItems.map((item) => (
            <li key={item.id}>
              <strong>{item.sku}</strong>
              <span>{item.name}</span>
              <span>{item.isActive ? "Active" : "Inactive"}</span>
              {editingMenuId === item.id ? (
                <div className="row">
                  <input
                    type="number"
                    step="0.01"
                    value={editingPrice}
                    onChange={(event) => setEditingPrice(event.target.value)}
                  />
                  <button
                    onClick={() => updateMenuPrice(item, editingPrice || item.basePrice)}
                  >
                    Save Price
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingMenuId(item.id);
                    setEditingPrice(item.basePrice);
                  }}
                >
                  Edit Price
                </button>
              )}
              <button onClick={() => toggleMenuActive(item)}>
                {item.isActive ? "Deactivate" : "Activate"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Revenue by Outlet</h2>
        <ul className="list">
          {revenueByOutlet.map((row) => (
            <li key={row.outletId}>
              <strong>{row.outletCode}</strong>
              <span>${Number(row.totalRevenue).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card wide">
        <h2>Top Selling Items by Outlet</h2>
        <ul className="list">
          {topItems.map((row, index) => (
            <li key={`${row.outletId}-${row.menuItemId}-${index}`}>
              <strong>{row.outletCode}</strong>
              <span>{row.itemName}</span>
              <span>{row.totalQuantity} sold</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
