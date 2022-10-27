import { LockClosedIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Element, Group } from "@prisma/client";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import { GroupBadge } from "./attributes/Group";

type PermissionsProps = {
  element: Element & {
    masterGroups: Group[];
    editGroups: Group[];
    interactGroups: Group[];
    viewGroups: Group[];
  };
  open: boolean;
  setOpen: (open: boolean) => void;
};

const Permissions = ({ element, open, setOpen }: PermissionsProps) => {
  return (
    <div>
      <button className="btn-xs btn" onClick={() => setOpen(!open)}>
        <LockClosedIcon className="h-4 w-4 text-white" />
      </button>
      <div
        className={`absolute right-0 flex w-96 flex-col space-y-1 rounded-md border-2 bg-white p-2 ${
          open ? "visible" : "invisible"
        }`}
      >
        <PermissionSelect
          permissionName="master"
          groups={element.masterGroups}
          element={element}
        />
        <PermissionSelect
          permissionName="edit"
          groups={element.editGroups}
          element={element}
        />
        <PermissionSelect
          permissionName="interact"
          groups={element.interactGroups}
          element={element}
        />
        <PermissionSelect
          permissionName="view"
          groups={element.viewGroups}
          element={element}
        />
      </div>
    </div>
  );
};

export default Permissions;

type PermissionSelectProps = {
  permissionName: string;
  groups: Group[];
  element: Element;
};

const PermissionSelect = ({
  permissionName,
  groups,
  element,
}: PermissionSelectProps) => {
  const [selected, setSelected] = useState<Group | null>(null);

  const utils = trpc.useContext();
  const allGroups = trpc.group.getAll.useQuery();
  const updatePerms = trpc.element.addPerms.useMutation();
  const removePerms = trpc.element.removePerms.useMutation();

  const handlePermChange = (group: Group) => {
    const permKey = `${permissionName}Groups`;
    updatePerms.mutate(
      { id: element.id, [permKey]: [group.id] },
      {
        onSuccess: () => {
          utils.element.getAll.invalidate();
          utils.element.getPage.invalidate({ route: element.parentId || "" });
        },
      }
    );
  };

  const handlePermRemove = (group: Group) => {
    const permKey = `${permissionName}Groups`;
    removePerms.mutate(
      { id: element.id, [permKey]: [group.id] },
      {
        onSuccess: () => {
          utils.element.getAll.invalidate();
          utils.element.getPage.invalidate({ route: element.parentId || "" });
        },
      }
    );
  };

  return (
    <>
      <div className="flex flex-row items-center justify-end">
        <label className="input-group flex-grow">
          <span className="w-20 text-sm capitalize">{permissionName}</span>
          <select
            className="select-bordered select select-sm w-56"
            name={permissionName}
            id={permissionName}
            value={selected?.id || 0}
            onChange={(e) =>
              setSelected(
                allGroups.data?.find((g) => g.id === e.target.value) || null
              )
            }
          >
            <option value="0">Select a group to add</option>
            {allGroups.data &&
              allGroups.data.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
          </select>
        </label>
        <button
          className="btn-sm btn"
          onClick={() => {
            if (selected) {
              handlePermChange(selected);
              setSelected(null);
            }
          }}
        >
          Add
        </button>
      </div>
      <div className="flex flex-row flex-wrap space-x-4">
        {groups.map((g) => (
          <div key={g.id} className="relative">
            <GroupBadge group={g} />
            <button
              className="absolute top-0 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-700 z-10"
              onClick={() => handlePermRemove(g)}
            >
              <TrashIcon className="h-4 w-4 text-white" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};
