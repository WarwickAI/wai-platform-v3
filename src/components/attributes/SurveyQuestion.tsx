import { Listbox } from "@headlessui/react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import cuid2 from "@paralleldrive/cuid2";
import { AttributeType } from "@prisma/client";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import { AttributeProps } from "./utils";

export const SurveyQuestionTypes = [
  AttributeType.Text,
  AttributeType.Date,
] as const;

export const SurveyQuestionsAttributeSchema = z.array(
  z.object({
    id: z.string(),
    text: z.string(),
    type: z.enum(SurveyQuestionTypes),
  })
).default([]);

export type SurveyQuestionType = typeof SurveyQuestionTypes[number];

export type SurveyQuestion = {
  id: string;
  text: string;
  type: typeof SurveyQuestionTypes[number];
};

export const SurveyQuestionsAttributeIcon = QuestionMarkCircleIcon;

const SurveyQuestionsAttribute = ({ attribute, edit }: AttributeProps) => {
  const utils = trpc.useContext();
  const editAttribute = trpc.attribute.editValue.useMutation();

  const handleAddQuestion = () => {
    const newValue = [
      ...(attribute.value as SurveyQuestion[]),
      {
        id: cuid2.createId(),
        text: "",
        type: "Text" as const,
      },
    ];
    handleValueUpdate(newValue);
  };

  const handleDeleteQuestion = (id: string) => {
    const newValue = (attribute.value as SurveyQuestion[]).filter(
      (q) => q.id !== id
    );
    handleValueUpdate(newValue);
  };

  const handleQuestionTextChange = (id: string, text: string) => {
    const newValue = (attribute.value as SurveyQuestion[]).map((q) => {
      if (q.id === id) {
        return {
          ...q,
          text,
        };
      }
      return q;
    });
    handleValueUpdate(newValue);
  };

  const handleQuestionTypeChange = (id: string, type: SurveyQuestionType) => {
    const newValue = (attribute.value as SurveyQuestion[]).map((q) => {
      if (q.id === id) {
        return {
          ...q,
          type,
        };
      }
      return q;
    });
    handleValueUpdate(newValue);
  };

  const handleValueUpdate = (newValue: SurveyQuestion[]) => {
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

  return (
    <div>
      {(attribute.value as SurveyQuestion[]).map((q) => {
        return (
          <SurveyQuestionAttribute
            key={q.id}
            question={q}
            edit={edit}
            onTypeChange={(v) => handleQuestionTypeChange(q.id, v)}
            onTextChange={(v) => handleQuestionTextChange(q.id, v)}
            onDelete={() => handleDeleteQuestion(q.id)}
          />
        );
      })}
      <div onClick={handleAddQuestion}>Add</div>
    </div>
  );
};

export default SurveyQuestionsAttribute;

const SurveyQuestionAttribute = ({
  question,
  onTypeChange,
  onTextChange,
  onDelete,
}: {
  question: SurveyQuestion;
  edit: boolean;
  onTypeChange: (type: SurveyQuestionType) => void;
  onTextChange: (text: string) => void;
  onDelete: () => void;
}) => {
  const debounced = useDebouncedCallback((v: string) => {
    onTextChange(v);
  }, 1000);

  const [textValue, setTextValue] = useState(question.text);

  useEffect(() => {
    return () => {
      debounced.cancel();
    };
  }, [debounced]);

  useEffect(() => {
    setTextValue(question.text);
  }, [question.text]);

  return (
    <div>
      <input
        type="text"
        value={textValue}
        onChange={(e) => {
          debounced(e.target.value);
          setTextValue(e.target.value);
        }}
      />
      <Listbox value={question.type} onChange={(v) => onTypeChange(v)}>
        <Listbox.Button>{question.type}</Listbox.Button>
        <Listbox.Options>
          {SurveyQuestionTypes.map((type) => (
            <Listbox.Option key={type} value={type}>
              {type}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
      <div onClick={onDelete}>Delete</div>
    </div>
  );
};
