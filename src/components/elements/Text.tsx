import { useMemo } from "react";
import MarkdownAttribute from "../attributes/Markdown";
import { ElementProps, RequiredAttribute } from "./utils";

export const TextRequiredAttributes: RequiredAttribute[] = [
  { name: "Markdown", type: "Markdown", value: "**Some Test Markdown**" },
];

const TextElement = ({ element, edit }: ElementProps) => {
  const markdownAttribute = useMemo(() => {
    return element.atts.find((attribute) => attribute.name === "Markdown");
  }, [element]);

  return markdownAttribute ? (
    <MarkdownAttribute attribute={markdownAttribute} edit={edit} />
  ) : (
    <p>loading text...</p>
  );
};

export default TextElement;
