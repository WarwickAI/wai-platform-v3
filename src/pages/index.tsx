import type { NextPage } from "next";
import { PageElementTmp } from "../components/elements";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const page = trpc.element.getPage.useQuery({ route: "" });

  return (
    <>
      {page && page.data ? (
        <PageElementTmp element={page.data} page={true} edit={false} />
      ) : page && page.isLoading ? (
        <p>Loading page..</p>
      ) : (
        <p>No Home Page Set</p>
      )}
    </>
  );
};

export default Home;
