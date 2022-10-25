// src/server/trpc/router/_app.ts
import { router } from "../trpc";
import { exampleRouter } from "./example";
import { authRouter } from "./auth";
import { elementRouter } from "./element";
import { groupRouter } from "./group";
import { userRouter } from "./user";
import { attributeRouter } from "./attribute";

export const appRouter = router({
  example: exampleRouter,
  element: elementRouter,
  attribute: attributeRouter,
  group: groupRouter,
  auth: authRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
