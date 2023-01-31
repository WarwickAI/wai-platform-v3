import { UserGroupIcon } from "@heroicons/react/24/solid";
import { Group } from "@prisma/client";
import { trpc } from "../../utils/trpc";
import { AttributeProps } from "./utils";

export const GroupAttibuteIcon = UserGroupIcon;

const GroupAttribute = ({ attribute }: AttributeProps) => {
  const group = trpc.group.get.useQuery(attribute.value as string);

  return <div>{group.data && <GroupBadge group={group.data} />}</div>;
};

export default GroupAttribute;

type GroupBadgeProps = {
  group: Group;
  children?: React.ReactNode;
};

export const GroupBadge = ({ group, children }: GroupBadgeProps) => {
  return (
    <div className="badge truncate text-ellipsis">
      {group.name}
      {children}
    </div>
  );
};
