import { NextPage } from "next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useMemo } from "react";
import PageElement from "../components/elements/Page";
import { ElementProps } from "../components/elements/utils";
import { trpc } from "../utils/trpc";

const Route: NextPage = () => {
  const router = useRouter();
  const { route } = router.query;

  // route is something like PageName-50fe8538-37b8-4dea-a435-63a9ae35553e
  // therefore, get the uuid only
  const pageRoute =
    route && (route as string).slice((route as string).indexOf("-") + 1);

  const page = trpc.element.getPage.useQuery({ route: pageRoute as string });

  // Also try finding a element of type event with the ID of the route
  const event = trpc.element.get.useQuery(route as string);

  return page.data ? (
    <PageElement element={page.data} page edit={false} />
  ) : event.data && event.data.type === "Event" ? (
    <EventClaim element={event.data} edit={false} />
  ) : (
    <p>Loading page...</p>
  );
};

export default Route;

const EventClaim = ({ element }: ElementProps) => {
  const user = trpc.user.getMe.useQuery();

  const titleAttribute = useMemo(() => {
    return element.atts.find((attribute) => attribute.name === "Title");
  }, [element]);

  const hasClaimedData = trpc.element.hasAttended.useQuery(element.id);

  const hasClaimed = useMemo(() => {
    return hasClaimedData.data;
  }, [hasClaimedData.data]);

  const claimAttendanceMutation = trpc.element.claimAttendance.useMutation({
    onSuccess: () => {
      hasClaimedData.refetch();
    },
  });

  return (
    <div className="p-12">
      <h1 className="text-2xl font-bold">
        {("Claiming " + titleAttribute?.value) as string}
      </h1>

      {/* If not logged in, redirect to login */}
      {!user.data ? (
        <div className="mt-4">
          <p className="text-lg">
            You need to be logged in to claim this event.{" "}
            <a
              onClick={() => {
                signIn();
              }}
            >
              Click here to login
            </a>
          </p>
        </div>
      ) : !hasClaimed ? (
        <div className="mt-4">
          <p className="text-lg">
            You are logged in as {user.data.email}.{" "}
            <a
              onClick={() => {
                claimAttendanceMutation.mutate(element.id);
              }}
            >
              Click here to claim!
            </a>
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-lg">You have already claimed this event. </p>
        </div>
      )}
    </div>
  );
};
