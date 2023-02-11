import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { DateAttributeSchema } from "../../components/attributes/Date";
import { UsersAttributeSchema } from "../../components/attributes/Users";
import { trpc } from "../../utils/trpc";

const EventClaim = () => {
  const router = useRouter();
  const { id } = router.query;
  const userData = trpc.user.getMe.useQuery();

  const eventData = trpc.element.get.useQuery(id as string);
  const editAttribute = trpc.attribute.editValue.useMutation({
    onSuccess: () => eventData.refetch(),
  });

  const titleAttribute = eventData.data?.atts.find(
    (att) => att.name === "Title"
  );

  const attendeesAttribute = eventData.data?.atts.find(
    (att) => att.name === "Attendees"
  );

  const startDate = useMemo(() => {
    const att = eventData.data?.atts.find((att) => att.name === "Start Date");

    if (!att) return undefined;

    const date = DateAttributeSchema.safeParse(att.value);

    if (!date.success) return undefined;

    return new Date(date.data);
  }, [eventData]);

  const endDate = useMemo(() => {
    const att = eventData.data?.atts.find((att) => att.name === "End Date");

    if (!att) return undefined;

    const date = DateAttributeSchema.safeParse(att.value);

    if (!date.success) return undefined;

    return new Date(date.data);
  }, [eventData]);

  const canClaim = useMemo(() => {
    const now = new Date();
    return !((startDate && now <= startDate) || (endDate && now >= endDate));
  }, [startDate, endDate]);

  const hasAttended = useMemo(() => {
    if (!attendeesAttribute || !userData.data?.id) return false;

    const attendees = UsersAttributeSchema.safeParse(attendeesAttribute.value);
    if (attendees.success) {
      return attendees.data.includes(userData.data?.id);
    }

    return false;
  }, [attendeesAttribute, userData]);

  const handleClaim = async () => {
    if (!attendeesAttribute || !userData.data?.id) return;

    const attendees = UsersAttributeSchema.safeParse(attendeesAttribute.value);

    if (attendees.success) {
      const newAttendees = [...attendees.data, userData.data?.id];

      await editAttribute.mutateAsync({
        id: attendeesAttribute.id,
        value: newAttendees,
      });
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center space-y-2">
      <p className="text-3xl">Claim attendance for</p>
      <p className="text-4xl font-semibold">
        {titleAttribute?.value as string}
      </p>
      {userData.data && canClaim ? (
        <button
          className="text-md rounded-lg bg-primary px-2 py-1 text-primary-content hover:bg-primary-focus"
          onClick={handleClaim}
          disabled={hasAttended}
        >
          {hasAttended
            ? "✅ You have claimed attendance"
            : "Click to Claim Attendance"}
        </button>
      ) : canClaim ? (
        <button
          className="text-md rounded-lg bg-primary px-2 py-1 text-primary-content hover:bg-primary-focus"
          onClick={() => signIn()}
        >
          Login to claim event
        </button>
      ) : (
        <p className="text-md text-warning font-semibold">
          You can no longer claim attendance for this event
        </p>
      )}
    </div>
  );
};

export default EventClaim;
