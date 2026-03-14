export const APP_ROUTES = {
  root: "/",
  hq: "/hq",
  outlet: "/outlet"
} as const;

export type AppRoutePath = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
