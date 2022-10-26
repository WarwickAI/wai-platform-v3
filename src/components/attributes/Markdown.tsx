import { Attribute } from "@prisma/client";
import dynamic from "next/dynamic";
const SimpleMDEReact = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import { trpc } from "../../utils/trpc";
import "easymde/dist/easymde.min.css";
import { useEffect, useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Options } from "easymde";
import ReactMarkdown from "react-markdown";
import ReactDOMServer from "react-dom/server";
import remarkGfm from "remark-gfm";
import remarkGitHub from "remark-github";

type MarkdownAttributeProps = {
  attribute: Attribute;
  edit: boolean;
};

const MarkdownAttribute = ({ attribute, edit }: MarkdownAttributeProps) => {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    setValue(attribute.value as string);
  }, [attribute.value]);

  const debounced = useDebouncedCallback((v: string) => {
    handleEdit(v);
  }, 1000);

  const utils = trpc.useContext();

  const editAttribute = trpc.attribute.editValue.useMutation();

  const handleEdit = (newValue: string) => {
    editAttribute.mutate(
      { id: attribute.id, value: newValue },
      { onSuccess: () => utils.element.getAll.invalidate() }
    );
  };

  const mdeOptions = useMemo(() => {
    return {
      status: false,
      toolbar: false,
      previewRender: (text) => {
        return ReactDOMServer.renderToString(
          <article className="prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkGitHub]}
              // renderers={{
              //   CodeBlock: CodeRenderer,
              //   Code: CodeRenderer,
              // }}
            >
              {text}
            </ReactMarkdown>
          </article>
        );
      },
    } as Options;
  }, []);

  return (
    <div>
      {edit ? (
        <SimpleMDEReact
          value={value as string}
          onChange={(v) => {
            debounced(v);
            setValue(v);
          }}
          options={mdeOptions}
        />
      ) : (
        <article className="prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            // renderers={{
            //   CodeBlock: CodeRenderer,
            //   Code: CodeRenderer,
            // }}
          >
            {value}
          </ReactMarkdown>
        </article>
      )}
    </div>
  );
};

export default MarkdownAttribute;
