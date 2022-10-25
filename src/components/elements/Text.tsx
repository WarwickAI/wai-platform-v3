import { Attribute, Element, User } from "@prisma/client";
import { useMemo } from "react";
import MarkdownAttribute from "../attributes/Markdown";

type TextElementProps = {
  element: Element & {
    user: User;
    atts: Attribute[];
  };
};

const TextElement = ({ element }: TextElementProps) => {
  const markdownAttribute = useMemo(() => {
    return element.atts.find((attribute) => attribute.name === "Markdown");
  }, [element]);

  return markdownAttribute ? (
    <MarkdownAttribute attribute={markdownAttribute}/>
  ) : (
    <p>loading text...</p>
  );
};

export default TextElement;
