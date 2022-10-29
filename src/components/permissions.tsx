import { LockClosedIcon } from "@heroicons/react/24/solid";
import { Element, Group } from "@prisma/client";
import { trpc } from "../utils/trpc";
import { GroupsEdit } from "./attributes/Groups";

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
      <div className="tooltip" data-tip="Edit Permissions">
        <button
          className={`rounded-full p-1 transition-colors ${
            open ? "bg-neutral" : "bg-white"
          }`}
          onClick={() => setOpen(!open)}
        >
          <LockClosedIcon
            className={`h-4 w-4 ${open ? "text-white" : "text-neutral"}`}
          />
        </button>
      </div>
      <div
        className={`absolute right-0 flex w-80 flex-col space-y-1 rounded-md border-2 bg-white p-2 transition-opacity ${
          open ? "opacity-100" : "invisible opacity-0"
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
  const utils = trpc.useContext();
  const updatePerms = trpc.element.addPerms.useMutation();
  const removePerms = trpc.element.removePerms.useMutation();

  const handlePermChange = (group: Group) => {
    const permKey = `${permissionName}Groups`;
    updatePerms.mutate(
      { id: element.id, [permKey]: [group.id] },
      {
        onSuccess: () => {
          utils.element.getAll.invalidate();
          utils.element.getPage.invalidate({ route: element.route || "" });
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
          utils.element.getPage.invalidate({ route: element.route || "" });
        },
      }
    );
  };

  return (
    <>
      <div
        className="tooltip text-left z-20"
        data-tip={`Edit groups for ${permissionName} permissions`}
      >
        <p className="text-sm font-semibold capitalize">{permissionName}</p>
      </div>
      <GroupsEdit
        groupIds={groups.map((g) => g.id)}
        onAdd={handlePermChange}
        onRemove={handlePermRemove}
        edit={true}
      />
    </>
  );
};
