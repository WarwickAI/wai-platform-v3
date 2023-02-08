import { useMemo } from "react";
import MarkdownAttribute from "../attributes/Markdown";
import { ElementProps, ElementAttributeDescription } from "./utils";

export const TextRequiredAttributes: ElementAttributeDescription[] = [
  { name: "Markdown", type: "Markdown" },
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
