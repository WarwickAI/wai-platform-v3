import { UsersIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import TextAttribute from "../attributes/Text";
import UsersAttribute from "../attributes/Users";
import { ElementProps, ElementAttributeDescription } from "./utils";

export const BadgeRequiredAttributes: ElementAttributeDescription[] = [
  { name: "Name", type: "Text" },
  { name: "Users", type: "Users" },
];

const BadgeElement = ({ element, edit }: ElementProps) => {
  const nameAttribute = useMemo(() => {
    return element.atts.find((attribute) => attribute.name === "Name");
  }, [element]);

  return nameAttribute ? (
    <div className="badge">
      <TextAttribute
        attribute={nameAttribute}
        size="md"
        edit={edit}
        placeholder="Edit badge name..."
      />
      {edit && <BadgeUsersPopover element={element} edit={edit} />}
    </div>
  ) : (
    <p>loading badge...</p>
  );
};

export default BadgeElement;

const BadgeUsersPopover = ({ element }: ElementProps) => {
  const usersAttribute = useMemo(() => {
    return element.atts.find((attribute) => attribute.name === "Users");
  }, [element]);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div
        className="flex items-center space-x-2 hover:cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <UsersIcon />
        <p className="text-sm">Users</p>
      </div>
      {usersAttribute ? (
        <div
          className={`absolute top-10 left-0 z-10 flex w-80 flex-col space-y-1 rounded-md border-2 bg-white p-2 transition-opacity ${
            isOpen ? "opacity-100" : "invisible opacity-0"
          }`}
        >
          <UsersAttribute attribute={usersAttribute} edit={true} />
        </div>
      ) : (
        <p>loading users...</p>
      )}
    </div>
  );
};
