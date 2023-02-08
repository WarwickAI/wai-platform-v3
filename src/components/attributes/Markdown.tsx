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
import { DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { AttributeProps } from "./utils";
import { z } from "zod";

export const MarkdownAttributeIcon = DocumentTextIcon;

export const MarkdownAttributeSchema = z.string().default("");

type MarkdownAttributeProps = AttributeProps & {
  placeholder?: string;
};

const MarkdownAttribute = ({
  attribute,
  edit,
  placeholder,
}: MarkdownAttributeProps) => {
  const [value, setValue] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);

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
      {
        onSuccess: (data) => {
          utils.element.getAll.invalidate();
          utils.element.get.invalidate(data.elementId);
          utils.element.queryAll.invalidate({ type: data.element.type });
          data.element.parent &&
            utils.element.getPage.invalidate({
              route: data.element.parent.route,
            });
        },
      }
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
    <div>
      {edit && editMode ? (
        <div className="relative">
          <SimpleMDEReact
            value={value as string}
            onChange={(v) => {
              debounced(v);
              setValue(v);
            }}
            options={mdeOptions}
          />
          <div className="absolute right-0 top-0 z-10 m-4">
            <button onClick={() => setEditMode(false)}>
              <XMarkIcon className="h-8 w-8 text-neutral" />
            </button>
          </div>
        </div>
      ) : (
        <article className="prose" onClick={() => setEditMode(true)}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {!edit || value.length > 0 ? value : placeholder ? placeholder : "*Edit markdown...*"}
          </ReactMarkdown>
        </article>
      )}
    </div>
  );
};

export default MarkdownAttribute;
