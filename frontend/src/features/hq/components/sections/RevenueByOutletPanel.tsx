import { RevenueByOutletRow } from "../../../../lib/api/types";
import { LoadingSpinner } from "../../../../shared/ui/Loading";
import { Panel } from "../../../../shared/ui/Panel";

interface RevenueByOutletPanelProps {
  revenueByOutlet: RevenueByOutletRow[];
  isLoading: boolean;
}

export function RevenueByOutletPanel({
  revenueByOutlet,
  isLoading
}: RevenueByOutletPanelProps) {
  return (
    <Panel title="Revenue by Outlet">
      <div className="mb-3 flex items-center justify-between">
        <span className="metric-pill">HQ Revenue Snapshot</span>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Refreshing revenue..." />
      ) : (
        <div className="space-y-2">
          {revenueByOutlet.map((row) => (
            <div key={row.outletId} className="list-row">
              <span className="font-semibold">{row.outletCode}</span>
              <span>{row.outletName}</span>
              <span className="text-right font-semibold text-moss">
                ${Number(row.totalRevenue).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
