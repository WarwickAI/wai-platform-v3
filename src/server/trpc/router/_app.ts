// src/server/trpc/router/_app.ts
import { router } from "../trpc";
import { exampleRouter } from "./example";
import { authRouter } from "./auth";
import { elementRouter } from "./element";

export const appRouter = router({
  example: exampleRouter,
  element: elementRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
