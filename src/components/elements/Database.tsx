import { CircleStackIcon } from "@heroicons/react/24/solid";
import { useMemo } from "react";
import MarkdownAttribute from "../attributes/Markdown";
import { ElementProps, RequiredAttribute } from "./utils";

export const DatabaseRequiredAttributes: RequiredAttribute[] = [
  { name: "Title", type: "Text", value: "Database Title" },
  { name: "Base Type", type: "DatabaseBaseType", value: "" },
];

export const DatabaseDescription = "Stores a list of items.";

export const DatabaseIcon = CircleStackIcon;

const DatabaseElement = ({ element, edit }: ElementProps) => {
  const markdownAttribute = useMemo(() => {
    return element.atts.find((attribute) => attribute.name === "Markdown");
  }, [element]);

  return markdownAttribute ? (
    <MarkdownAttribute attribute={markdownAttribute} edit={edit} />
  ) : (
    <p>loading text...</p>
  );
};

export default DatabaseElement;
