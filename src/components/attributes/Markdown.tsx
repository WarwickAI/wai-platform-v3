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

const MarkdownAttribute = ({ attribute }: { attribute: Attribute }) => {
  const [value, setValue] = useState<string>("");

  const [hovered, setHovered] = useState<boolean>(false);

  useEffect(() => {
    setValue(attribute.value as string);
  }, [attribute.value]);

  const debounced = useDebouncedCallback((v: string) => {
    handleEdit(v);
  }, 1000);

  const utils = trpc.useContext();

  const edit = trpc.attribute.editValue.useMutation();

  const handleEdit = (newValue: string) => {
    edit.mutate(
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
              remarkPlugins={[remarkGfm]}
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
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered ? (
        <SimpleMDEReact
          className="w-full max-w-lg"
          value={attribute.value as string}
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
