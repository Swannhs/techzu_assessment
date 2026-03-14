import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  enqueueToast,
  setActiveTab,
  setSelectedOutletId,
  setStatus
} from "../../redux/slices/appSlice";
import { fetchHqData } from "../../redux/slices/hqSlice";

export function useAppBootstrap() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { activeTab, selectedOutletId } = useAppSelector((state) => state.app);
  const { outlets } = useAppSelector((state) => state.hq);
  const activeRouteTab = location.pathname.startsWith("/outlet") ? "outlet" : "hq";

  useEffect(() => {
    void dispatch(fetchHqData())
      .unwrap()
      .then(() => dispatch(setStatus("Ready")))
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Request failed";
        dispatch(setStatus(message));
        dispatch(enqueueToast(message, "error"));
      });
  }, [dispatch]);

  useEffect(() => {
    if (activeTab !== activeRouteTab) {
      dispatch(setActiveTab(activeRouteTab));
    }
  }, [activeRouteTab, activeTab, dispatch]);

  useEffect(() => {
    if (selectedOutletId !== null || outlets.length === 0) {
      return;
    }

    dispatch(setSelectedOutletId(outlets[0].id));
  }, [dispatch, outlets, selectedOutletId]);
}
