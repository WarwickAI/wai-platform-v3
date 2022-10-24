// src/server/trpc/router/_app.ts
import { router } from "../trpc";
import { exampleRouter } from "./example";
import { authRouter } from "./auth";
import { elementRouter } from "./element";
import { groupRouter } from "./group";

export const appRouter = router({
  example: exampleRouter,
  element: elementRouter,
  group: groupRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
