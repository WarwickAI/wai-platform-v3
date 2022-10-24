import { Group } from "@prisma/client";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

const Groups: NextPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const groups = trpc.group.getAll.useQuery();

  const utils = trpc.useContext();
  const deleteGroup = trpc.group.delete.useMutation();

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

  return (
    <div className="p-8">
      <h1 className="mb-8 text-4xl font-bold">Groups Admin</h1>
      <div className="flex flex-row flex-wrap items-center space-x-2">
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
          <button className="btn btn-sm" onClick={handleDeleteGroup}>
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
      <label htmlFor="create-group-modal" className="btn btn-sm">
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
            <label htmlFor="create-group-modal" className="btn btn-error">
              Cancel
            </label>
            <label
              htmlFor="create-group-modal"
              className="btn btn-success"
              onClick={() => handleCreateGroup()}
            >
              Edit!
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

  const createGroup = trpc.group.create.useMutation();

  useEffect(() => {
    setNewName(name || "");
    setNewDescription(description || "");
  }, [name, description]);

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
      <label htmlFor="edit-group-modal" className="btn btn-sm">
        <PencilIcon className="h-4 w-4 font-bold text-white" />
      </label>
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
            <label htmlFor="edit-group-modal" className="btn btn-error">
              Cancel
            </label>
            <label
              htmlFor="edit-group-modal"
              className="btn btn-success"
              onClick={() => handleCreateGroup()}
            >
              Edit!
            </label>
          </div>
        </div>
      </div>
    </>
  );
};
