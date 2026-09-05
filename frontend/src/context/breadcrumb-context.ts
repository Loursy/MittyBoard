import { createContext } from "react";

export interface Crumb {
  label: string;
  to?: string;
}

export interface BreadcrumbContextValue {
  crumbs: Crumb[];
  setCrumbs: (crumbs: Crumb[]) => void;
}

export const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);
