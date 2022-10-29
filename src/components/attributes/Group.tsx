import { Attribute, Group } from "@prisma/client";
import { trpc } from "../../utils/trpc";

type GroupAttributeProps = {
  attribute: Attribute;
  edit: boolean;
};

const GroupAttribute = ({ attribute, edit }: GroupAttributeProps) => {
  const group = trpc.group.get.useQuery(attribute.value as string);

  return <div>{group.data && <GroupBadge group={group.data} />}</div>;
};

export default GroupAttribute;

type GroupBadgeProps = {
  group: Group;
};

export const GroupBadge = ({ group }: GroupBadgeProps) => {
  return <div className="badge truncate text-ellipsis">{group.name}</div>;
};
