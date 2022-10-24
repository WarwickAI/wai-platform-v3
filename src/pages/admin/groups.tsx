import { Group } from "@prisma/client";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";

const Groups: NextPage = () => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const groups = trpc.group.getAll.useQuery();

  const utils = trpc.useContext();
  const deleteGroup = trpc.group.delete.useMutation();

  const handleDeleteGroup = () => {
    if (!selectedGroup) return;

    deleteGroup.mutate(
      {
        id: selectedGroup,
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
    <div>
      <h1>Groups</h1>
      {groups.data ? (
        <select
          className="select-bordered select w-full max-w-xs"
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
      <GroupEditModal />
      <label className="btn" onClick={handleDeleteGroup}>
        -
      </label>
      {selectedGroup && (
        <GroupEditModal
          id={selectedGroup.id}
          name={selectedGroup.name}
          description={selectedGroup.description || undefined}
        />
      )}
    </div>
  );
};

export default Groups;

type GroupEditModalProps = {
  id?: string;
  name?: string;
  description?: string;
};

const GroupEditModal = ({ id, name, description }: GroupEditModalProps) => {
  const [newName, setNewName] = useState<string>(name || "");
  const [newDescription, setNewDescription] = useState<string>(
    description || ""
  );

  const utils = trpc.useContext();

  const createGroup = trpc.group.create.useMutation();
  const editGroup = trpc.group.edit.useMutation();

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

  const handleEditGroup = () => {
    if (!id) return;

    editGroup.mutate(
      {
        id,
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
      <label htmlFor="create-group-modal" className="modal-button btn">
        {id ? "Edit" : "Create"}
      </label>
      <input type="checkbox" id="create-group-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Create New Group</h3>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              placeholder="Group Name"
              className="input-bordered input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <input
              type="text"
              placeholder="Group Description"
              className="input-bordered input"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>

          <div className="modal-action">
            <label htmlFor="create-group-modal" className="btn-error btn">
              Cancel
            </label>
            <label
              htmlFor="create-group-modal"
              className="btn-success btn"
              onClick={id ? handleEditGroup : handleCreateGroup}
            >
              {id ? "Edit!" : "Create!"}
            </label>
          </div>
        </div>
      </div>
    </>
  );
};
