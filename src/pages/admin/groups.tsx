import { Group, User } from "@prisma/client";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

const Groups: NextPage = () => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const group = trpc.group.get.useQuery(selectedGroup?.id || "");
  const groups = trpc.group.getAll.useQuery();
  const users = trpc.user.getAll.useQuery();

  const utils = trpc.useContext();
  const deleteGroup = trpc.group.delete.useMutation();
  const addUser = trpc.group.addUser.useMutation();
  const removeUser = trpc.group.removeUser.useMutation();

  const handleDeleteGroup = () => {
    if (!selectedGroup) return;

    deleteGroup.mutate(
      {
        id: selectedGroup.id,
      },
      {
        onSuccess: () => {
          utils.group.getAll.invalidate();
          setSelectedGroup(null);
        },
      }
    );
  };

  const handleAddUser = () => {
    if (!selectedGroup || !selectedUser) return;

    addUser.mutate(
      {
        groupId: selectedGroup.id,
        userId: selectedUser.id,
      },
      {
        onSuccess: () => {
          utils.group.get.invalidate(selectedGroup.id);
          setSelectedUser(null);
        },
      }
    );
  };

  const handleRemoveUser = (userId: string) => {
    if (!selectedGroup) return;

    removeUser.mutate(
      {
        groupId: selectedGroup.id,
        userId,
      },
      {
        onSuccess: () => {
          utils.group.get.invalidate(selectedGroup.id);
        },
      }
    );
  };

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">Groups Admin</h1>
      <div className="mt-8 flex flex-row flex-wrap items-center space-x-2">
        {groups.data ? (
          <select
            className="select-bordered select"
            value={selectedGroup?.id || 0}
            onChange={(e) =>
              setSelectedGroup(
                groups.data.find((group) => group.id === e.target.value) || null
              )
            }
          >
            <option value={0} disabled>
              Pick a Group
            </option>
            {groups.data.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        ) : (
          <p>Loading...</p>
        )}
        <div className="btn-group">
          <GroupCreateModal />
          <button className="btn-sm btn" onClick={handleDeleteGroup}>
            <TrashIcon className="h-4 w-4 font-bold text-white" />
          </button>
          {selectedGroup && (
            <GroupEditModal
              id={selectedGroup.id}
              name={selectedGroup.name}
              description={selectedGroup.description || undefined}
            />
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-row flex-wrap">
        {selectedGroup &&
          group.data &&
          group.data.users.map((user) => (
            <UserBadge
              key={user.id}
              user={user}
              removeUser={handleRemoveUser}
            />
          ))}
      </div>
      {selectedGroup && users.data && (
        <div className="flex flex-row flex-wrap items-center space-x-2">
          <select
            className="select-bordered select mt-4"
            value={selectedUser?.id || 0}
            onChange={(e) =>
              setSelectedUser(
                users.data.find((user) => user.id === e.target.value) || null
              )
            }
          >
            <option value={0} disabled>
              Add User
            </option>
            {users.data.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </select>
          <button className="btn-sm btn" onClick={handleAddUser}>
            <PlusIcon className="h-4 w-4 font-bold text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Groups;

const GroupCreateModal = () => {
  const [newName, setNewName] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");

  const utils = trpc.useContext();

  const createGroup = trpc.group.create.useMutation();

  const handleCreateGroup = () => {
    createGroup.mutate(
      {
        name: newName,
        description: newDescription,
      },
      {
        onSuccess: () => {
          utils.group.getAll.invalidate();
          setNewName("");
          setNewDescription("");
        },
      }
    );
  };

  return (
    <>
      <label htmlFor="create-group-modal" className="btn-sm btn">
        <PlusIcon className="h-4 w-4 font-bold text-white" />
      </label>
      <input
        type="checkbox"
        id={"create-group-modal"}
        className={"modal-toggle"}
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Create New Group</h3>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <label className="input-group">
              <span>Name</span>
              <input
                type="text"
                placeholder="Group Name"
                className="input-bordered input min-w-0"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </label>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <label className="input-group">
              <span>Description</span>
              <input
                type="text"
                placeholder="Group Description"
                className="input-bordered input min-w-0"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </label>
          </div>

          <div className="modal-action">
            <label htmlFor="create-group-modal" className="btn-error btn">
              Cancel
            </label>
            <label
              htmlFor="create-group-modal"
              className="btn-success btn"
              onClick={() => handleCreateGroup()}
            >
              Create!
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

type GroupEditModalProps = {
  id: string;
  name: string;
  description?: string;
};

const GroupEditModal = ({ id, name, description }: GroupEditModalProps) => {
  const [newName, setNewName] = useState<string>(name || "");
  const [newDescription, setNewDescription] = useState<string>(
    description || ""
  );

  const utils = trpc.useContext();

  const editGroup = trpc.group.edit.useMutation();

  useEffect(() => {
    setNewName(name || "");
    setNewDescription(description || "");
  }, [name, description]);

  const handleEditGroup = () => {
    editGroup.mutate(
      {
        id,
        name: newName,
        description: newDescription,
      },
      {
        onSuccess: () => utils.group.getAll.invalidate(),
      }
    );
  };

  return (
    <>
      <input
        type="checkbox"
        id={"edit-group-modal"}
        className={"modal-toggle"}
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Create New Group</h3>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <label className="input-group">
              <span>Name</span>
              <input
                type="text"
                placeholder="Group Name"
                className="input-bordered input min-w-0"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </label>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <label className="input-group">
              <span>Description</span>
              <input
                type="text"
                placeholder="Group Description"
                className="input-bordered input min-w-0"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </label>
          </div>

          <div className="modal-action">
            <label htmlFor="edit-group-modal" className="btn-error btn">
              Cancel
            </label>
            <label
              htmlFor="edit-group-modal"
              className="btn-success btn"
              onClick={() => handleEditGroup()}
            >
              Edit!
            </label>
          </div>
        </div>
      </div>
      <label htmlFor="edit-group-modal" className="btn-sm btn">
        <PencilIcon className="h-4 w-4 font-bold text-white" />
      </label>
    </>
  );
};

type UserBadgeProps = {
  user: User;
  removeUser: (id: string) => void;
};

const UserBadge = ({ user, removeUser }: UserBadgeProps) => {
  return (
    <div className="badge-secondary badge badge-lg">
      <button onClick={() => removeUser(user.id)}>
        <XMarkIcon className="h-4 w-4 text-white" />
      </button>
      <span className="ml-2">{user.email}</span>
    </div>
  );
};
