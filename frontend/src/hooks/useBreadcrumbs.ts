import { useContext } from "react";
import { BreadcrumbContext } from "../context/breadcrumb-context";

export function useBreadcrumbs() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error("useBreadcrumbs must be used within a BreadcrumbProvider");
  return ctx;
}
