import { PlusIcon, TrashIcon, UsersIcon } from "@heroicons/react/24/solid";
import { User } from "@prisma/client";
import { useMemo, useState } from "react";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import { UserBadge } from "./User";
import { AttributeProps } from "./utils";

export const UsersAttibuteIcon = UsersIcon;

export const UsersAttributeSchema = z.array(z.string()).default([]);

const UsersAttribute = ({ attribute, edit }: AttributeProps) => {
  const utils = trpc.useContext();

  const editAttribute = trpc.attribute.editValue.useMutation();

  const handleEdit = (newValue: string[]) => {
    editAttribute.mutate(
      { id: attribute.id, value: newValue },
      {
        onSuccess: (data) => {
          utils.element.getAll.invalidate();
          utils.element.get.invalidate(data.elementId);
          utils.element.queryAll.invalidate({ type: data.element.type });
          data.element.parent &&
            utils.element.getPage.invalidate({
              route: data.element.parent.route,
            });
        },
      }
    );
  };

  return (
    <UsersEdit
      userIds={attribute.value as string[]}
      onAdd={(g) => {
        const users = attribute.value as string[];
        handleEdit([...users, g.id]);
      }}
      onRemove={(g) => {
        const users = attribute.value as string[];
        handleEdit(users.filter((id) => id !== g.id));
      }}
      edit={edit}
    />
  );
};

export default UsersAttribute;

type UsersEditProps = {
  userIds: string[];
  onAdd: (user: User) => void;
  onRemove: (user: User) => void;
  edit: boolean;
};

export const UsersEdit = ({
  userIds,
  onAdd,
  onRemove,
  edit,
}: UsersEditProps) => {
  const [selected, setSelected] = useState<User | null>(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const usersData = trpc.user.getAll.useQuery();

  const users = useMemo(() => {
    if (!usersData.data) return [];

    return usersData.data.filter((user) => {
      return (userIds as string[]).includes(user.id);
    });
  }, [usersData.data, userIds]);

  return (
    <div className="flex flex-row flex-wrap items-end space-x-4">
      {users.map((u) => (
        <div key={u.id} className="relative">
          <UserBadge user={u} />
          {edit && (
            <button
              className="absolute top-0 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-700"
              onClick={() => {
                onRemove(u);
              }}
            >
              <TrashIcon className="h-4 w-4 text-white" />
            </button>
          )}
        </div>
      ))}
      {edit && (
        <div
          className={`badge truncate text-ellipsis text-white ${
            isSelectOpen ? "p-2" : "p-1"
          }`}
        >
          {isSelectOpen && (
            <select
              className="select-ghost select select-sm w-40 text-xs"
              value={selected?.id || 0}
              onChange={(e) =>
                setSelected(
                  usersData.data?.find((u) => u.id === e.target.value) || null
                )
              }
            >
              <option value="0" disabled>
                Select a user
              </option>
              {usersData.data &&
                usersData.data.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email}
                  </option>
                ))}
            </select>
          )}
          <button
            onClick={() => {
              if (isSelectOpen) {
                selected && onAdd(selected);
                setSelected(null);
              } else {
                setIsSelectOpen(true);
              }
            }}
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
