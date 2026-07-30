export const WORKSPACE_ROUTES = [
  "/schedule",
  "/clients",
  "/programs",
  "/ai",
] as const;

export const DEFAULT_WORKSPACE_ROUTE = "/schedule";

/** App home after login — Contacts hub */
export const DEFAULT_APP_ROUTE = "/contacts";

export function isWorkspaceRoute(pathname: string): boolean {
  return WORKSPACE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export const SIDEBAR_ROUTES = {
  contacts: "/contacts",
  apps: "/apps",
  crm: DEFAULT_WORKSPACE_ROUTE,
  profile: "/profile",
  settings: "/settings",
} as const;

export const TRAINER_PROTECTED_PREFIXES = [
  ...WORKSPACE_ROUTES,
  SIDEBAR_ROUTES.contacts,
  SIDEBAR_ROUTES.apps,
  SIDEBAR_ROUTES.profile,
  SIDEBAR_ROUTES.settings,
] as const;

export function isTrainerProtectedRoute(pathname: string): boolean {
  return TRAINER_PROTECTED_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
