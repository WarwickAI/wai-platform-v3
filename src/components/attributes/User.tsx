import { UserIcon } from "@heroicons/react/24/solid";
import { User } from "@prisma/client";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import { AttributeProps } from "./utils";

export const UserAttibuteIcon = UserIcon;

export const UserAttributeSchema = z.string().default("");

const UserAttribute = ({ attribute }: AttributeProps) => {
  const user = trpc.user.get.useQuery(attribute.value as string);

  return <div>{user.data && <UserBadge user={user.data} />}</div>;
};

export default UserAttribute;

type UserBadgeProps = {
  user: User;
};

export const UserBadge = ({ user }: UserBadgeProps) => {
  return <div className="badge truncate text-ellipsis">{user.email}</div>;
};
