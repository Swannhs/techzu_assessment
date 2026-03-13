import { TopItemByOutletRow } from "../../../../lib/api/types";
import { LoadingSpinner } from "../../../../shared/ui/Loading";
import { Panel } from "../../../../shared/ui/Panel";

interface TopItemsPanelProps {
  topItems: TopItemByOutletRow[];
  isLoading: boolean;
}

export function TopItemsPanel({ topItems, isLoading }: TopItemsPanelProps) {
  return (
    <Panel title="Top Selling Items by Outlet" className="lg:col-span-2">
      <div className="mb-3 flex items-center justify-between">
        <span className="metric-pill">Top 5 per outlet</span>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Refreshing top items..." />
      ) : (
        <div className="space-y-2">
          {topItems.map((row, index) => (
            <div key={`${row.outletId}-${row.menuItemId}-${index}`} className="list-row">
              <span className="font-semibold">{row.outletCode}</span>
              <span>{row.itemName}</span>
              <span className="text-right">{row.totalQuantity} sold</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
