import { UserIcon } from "@heroicons/react/24/solid";
import { User } from "@prisma/client";
import { MD5 } from "crypto-js";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import { AttributeProps } from "./utils";
import Image from "next/image";
import { Combobox, Popover } from "@headlessui/react";
import { useMemo, useState } from "react";

export const UserAttibuteIcon = UserIcon;

export const UserAttributeSchema = z.string().default("");

const UserAttribute = ({ attribute }: AttributeProps) => {
  const utils = trpc.useContext();
  const [query, setQuery] = useState("");

  const { data: user } = trpc.user.get.useQuery(attribute.value as string);

  const { data: allUsers } = trpc.user.getAll.useQuery();

  const filteredUsers = useMemo(() => {
    if (!query) return allUsers;

    return allUsers?.filter((u) => {
      return (
        u.email?.toLowerCase().includes(query.toLowerCase()) ||
        u.name?.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [query, allUsers]);

  const editAttribute = trpc.attribute.editValue.useMutation({
    onSuccess: (data) => {
      utils.element.getAll.invalidate();
      utils.element.get.invalidate(data.elementId);
      utils.element.queryAll.invalidate({ type: data.element.type });
      data.element.parent &&
        utils.element.getPage.invalidate({
          route: data.element.parent.route,
        });
    },
  });

  const handleEdit = (newValue: string) => {
    // Find the user with the email
    const user = allUsers?.find((u) => u.email === newValue);

    if (!user) return;

    editAttribute.mutate({ id: attribute.id, value: user.id });
  };

  return (
    <Popover className="relative w-full">
      {({ open }) => (
        <>
          <Popover.Button
            className={`flex w-full flex-row items-center justify-center space-x-1 rounded-lg px-2 py-1 font-semibold ${
              open ? "outline-2" : "outline-none"
            }`}
          >
            {user ? (
              <div className="flex flex-row items-center space-x-2">
                <Image
                  width={60}
                  height={60}
                  className={"rounded-full"}
                  src={
                    "https://www.gravatar.com/avatar/" +
                    MD5(user.email || "") +
                    "?s=120"
                  }
                  alt={"Profile picture of " + user?.email}
                />
                <p className="text-base">{user?.name}</p>
              </div>
            ) : (
              <p>select user</p>
            )}
          </Popover.Button>
          <Popover.Panel className="absolute top-10 left-0 z-10 flex flex-col space-y-1 rounded-md border-2 bg-white p-2">
            <Combobox value={user?.email} onChange={handleEdit}>
              <Combobox.Input
                className="input-ghost input w-full border-0"
                placeholder="Select a user"
                onChange={(e) => setQuery(e.target.value)}
              />
              <Combobox.Options className="rounded-md bg-white shadow-lg">
                {filteredUsers?.map((u) => (
                  <Combobox.Option key={u.email} value={u.email}>
                    <div className="flex flex-row items-center space-x-2">
                      <p>{u?.name}</p>
                    </div>
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Combobox>
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

export default UserAttribute;

type UserBadgeProps = {
  user: User;
};

export const UserBadge = ({ user }: UserBadgeProps) => {
  return <div className="badge truncate text-ellipsis">{user.email}</div>;
};
