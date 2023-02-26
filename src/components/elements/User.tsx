import { useMemo } from "react";
import { ElementAttributeDescription, ElementProps } from "./utils";
import UserAttribute from "../attributes/User";

export const UserRequiredAttributes: ElementAttributeDescription[] = [
  { name: "User", type: "User" },
];

const User = ({ element, edit }: ElementProps) => {
  const userAttribute = useMemo(() => {
    return element.atts.find((attribute) => attribute.name === "User");
  }, [element]);

  return (
    <div>
      {userAttribute && <UserAttribute attribute={userAttribute} edit={edit} />}
    </div>
  );
};

export default User;
