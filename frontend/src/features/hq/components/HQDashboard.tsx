import { useAppSelector } from "../../../redux/hooks";
import { AssignMenuPanel } from "./sections/AssignMenuPanel";
import { CreateMenuItemPanel } from "./sections/CreateMenuItemPanel";
import { CreateOutletPanel } from "./sections/CreateOutletPanel";
import { MasterMenuPanel } from "./sections/MasterMenuPanel";
import { OutletListPanel } from "./sections/OutletListPanel";
import { RevenueByOutletPanel } from "./sections/RevenueByOutletPanel";
import { TopItemsPanel } from "./sections/TopItemsPanel";

export function HQDashboard() {
  const { selectedOutletId } = useAppSelector((state) => state.app);
  const { outlets, menuItems, revenueByOutlet, topItems, isLoading, currentActionKey } =
    useAppSelector((state) => state.hq);

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <CreateOutletPanel isLoading={isLoading} currentActionKey={currentActionKey} />
      <CreateMenuItemPanel isLoading={isLoading} currentActionKey={currentActionKey} />
      <AssignMenuPanel
        outlets={outlets}
        menuItems={menuItems}
        selectedOutletId={selectedOutletId}
        isLoading={isLoading}
        currentActionKey={currentActionKey}
      />
      <OutletListPanel outlets={outlets} isLoading={isLoading} />
      <MasterMenuPanel
        menuItems={menuItems}
        isLoading={isLoading}
        currentActionKey={currentActionKey}
      />
      <RevenueByOutletPanel revenueByOutlet={revenueByOutlet} isLoading={isLoading} />
      <TopItemsPanel topItems={topItems} isLoading={isLoading} />
    </div>
  );
}
