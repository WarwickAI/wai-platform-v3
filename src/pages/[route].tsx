import { NextPage } from "next";
import { useRouter } from "next/router";
import PageElement from "../components/elements/Page";
import { trpc } from "../utils/trpc";

const Route: NextPage = () => {
  const router = useRouter();
  const { route } = router.query;

  // route is something like PageName-50fe8538-37b8-4dea-a435-63a9ae35553e
  // therefore, get the uuid only
  const pageRoute =
    route && (route as string).slice((route as string).indexOf("-") + 1);

  const page = trpc.element.getPage.useQuery({ route: pageRoute as string });

  return page.data ? (
    <PageElement element={page.data} page />
  ) : (
    <p>loading page...</p>
  );
};

export default Route;
