import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { PageElementTmp } from "../components/elements/index";
import { trpc } from "../utils/trpc";

const Route: NextPage = () => {
  const router = useRouter();
  const { route } = router.query;

  // route is something like PageName-50fe8538-37b8-4dea-a435-63a9ae35553e
  // or is a custom route.
  // Therefore, we first check if the route is a UUID (should contain a dash followed by uuid4)
  // otherwise, we assume it's a custom route
  const pageRoute = useMemo(() => {
    if (route && typeof route === "string") {
      const split = route.split("-");
      if (split.length === 6) {
        // Last 4 parts are uuid4
        return route.slice(route.indexOf("-") + 1);
      }

      return route;
    }
  }, [route]);

  const page = trpc.element.getPage.useQuery(
    { route: pageRoute as string },
    {
      enabled: !!pageRoute,
    }
  );

  return page.data ? (
    <PageElementTmp element={page.data} page edit={false} />
  ) : (
    <p>Loading page...</p>
  );
};

export default Route;
