import { Outlet, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../routes/routePaths";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setSelectedOutletId } from "../../redux/slices/appSlice";
import { LoadingSpinner } from "../../shared/ui/Loading";
import { ToastContainer } from "../../shared/ui/ToastContainer";

export function AppLayout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { status, selectedOutletId } = useAppSelector((state) => state.app);
  const { outlets, isLoading } = useAppSelector((state) => state.hq);
  const activeTab = useAppSelector((state) =>
    state.app.activeTab === "outlet" ? "outlet" : "hq"
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_8%_10%,#fff7f0,transparent_40%),radial-gradient(circle_at_92%_18%,#daf0e5,transparent_42%),linear-gradient(145deg,#f8f4e8,#d6e8de_45%,#b4d0c3)] text-ink">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-float backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-moss/80">Operations Console</p>
              <h1 className="mt-1 max-w-xl font-['Space_Grotesk'] text-4xl font-bold leading-tight sm:text-5xl">
                HQ and Outlet Control Surface
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-moss/80">
                Manage menu lifecycle, outlet assignment, local inventory, sales, and reporting
                from one interface.
              </p>
            </div>

            <div className="grid min-w-[240px] gap-3 rounded-2xl bg-gradient-to-br from-moss to-[#17332a] p-4 text-sm text-white shadow-float">
              <label className="text-xs uppercase tracking-wide text-white/75">Active Outlet</label>
              <select
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none transition focus:border-white/50"
                value={selectedOutletId ?? ""}
                onChange={(event) => dispatch(setSelectedOutletId(Number(event.target.value)))}
                disabled={isLoading}
              >
                {isLoading ? (
                  <option className="text-ink" value="">
                    Loading outlets...
                  </option>
                ) : outlets.length === 0 ? (
                  <option className="text-ink" value="">
                    No outlets available
                  </option>
                ) : (
                  outlets.map((outlet) => (
                    <option className="text-ink" key={outlet.id} value={outlet.id}>
                      {outlet.code} - {outlet.name}
                    </option>
                  ))
                )}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${activeTab === "hq" ? "bg-peach text-ink" : "bg-white/10 text-white hover:bg-white/20"}`}
                  onClick={() => navigate(APP_ROUTES.hq)}
                  disabled={isLoading}
                >
                  HQ
                </button>
                <button
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${activeTab === "outlet" ? "bg-peach text-ink" : "bg-white/10 text-white hover:bg-white/20"}`}
                  onClick={() => navigate(APP_ROUTES.outlet)}
                  disabled={isLoading}
                >
                  Outlet
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="mb-6 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm shadow-float backdrop-blur">
          <span className="mr-2 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            LIVE
          </span>
          <span className="font-semibold text-moss">Status:</span>{" "}
          {isLoading ? <LoadingSpinner label="Fetching latest data..." /> : status}
        </div>

        <Outlet />
      </div>
      <ToastContainer />
    </div>
  );
}
