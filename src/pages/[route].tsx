import { NextPage } from "next";
import { useRouter } from "next/router";
import PageElement from "../components/elements/Page";
import { trpc } from "../utils/trpc";

const Route: NextPage = () => {
  const router = useRouter();
  const { route } = router.query;

  const page = trpc.element.getPage.useQuery({ route: route as string });

  return page.data ? (
    <PageElement element={page.data} page />
  ) : (
    <p>loading page...</p>
  );
};

export default Route;
