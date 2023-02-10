import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import cuid2 from "@paralleldrive/cuid2";
import { AttributeType } from "@prisma/client";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { z } from "zod";
import attributes from ".";
import { trpc } from "../../utils/trpc";
import { AttributeProps } from "./utils";

export const SurveyQuestionTypes = [
  AttributeType.Text,
  AttributeType.Markdown,
  AttributeType.Date,
  AttributeType.Number,
  AttributeType.File,
] as const;

export const SurveyQuestionsAttributeSchema = z
  .array(
    z.object({
      id: z.string(),
      text: z.string(),
      type: z.enum(SurveyQuestionTypes),
    })
  )
  .default([]);

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

  const handleMoveUp = (id: string) => {
    const curValue = attribute.value as SurveyQuestion[];

    const index = curValue.findIndex((q) => q.id === id);
    if (index === 0 || curValue.length < 2) return;

    const newValue = [...curValue];
    newValue[index] = newValue[index - 1]!;
    newValue[index - 1] = curValue[index]!;

    handleValueUpdate(newValue);
  };

  const handleMoveDown = (id: string) => {
    const curValue = attribute.value as SurveyQuestion[];

    const index = curValue.findIndex((q) => q.id === id);
    if (index === curValue.length - 1 || curValue.length < 2) return;

    const newValue = [...curValue];
    newValue[index] = newValue[index + 1]!;
    newValue[index + 1] = curValue[index]!;

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
      <div className="flex flex-col divide-y-2">
        {(attribute.value as SurveyQuestion[]).map((q) => {
          return (
            <SurveyQuestionAttribute
              key={q.id}
              question={q}
              edit={edit}
              onTypeChange={(v) => handleQuestionTypeChange(q.id, v)}
              onTextChange={(v) => handleQuestionTextChange(q.id, v)}
              onMoveUp={() => handleMoveUp(q.id)}
              onMoveDown={() => handleMoveDown(q.id)}
              onDelete={() => handleDeleteQuestion(q.id)}
            />
          );
        })}
      </div>
      <div className="flex w-full flex-row justify-center">
        <button onClick={handleAddQuestion}>
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default SurveyQuestionsAttribute;

const SurveyQuestionAttribute = ({
  question,
  onTypeChange,
  onTextChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  question: SurveyQuestion;
  edit: boolean;
  onTypeChange: (type: SurveyQuestionType) => void;
  onTextChange: (text: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
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
    <div className="pt-2">
      <div className="flex flex-row items-center space-x-1">
        <input
          type="text"
          value={textValue}
          onChange={(e) => {
            debounced(e.target.value);
            setTextValue(e.target.value);
          }}
          className="w-64 rounded-md border border-gray-300"
          placeholder="Question text"
        />
        <button onClick={onMoveUp}>
          <ChevronUpIcon className="h-6 w-6" />
        </button>
        <button onClick={onMoveDown}>
          <ChevronDownIcon className="h-6 w-6" />
        </button>
        <button onClick={onDelete}>
          <TrashIcon className="h-6 w-6 text-warning" />
        </button>
      </div>
      <div className="flex flex-row flex-wrap items-center space-x-2 rounded-md p-2">
        {SurveyQuestionTypes.map((type) => {
          const typeInfo = attributes[type as AttributeType];
          if (!typeInfo) return <></>;

          const TypeIcon = typeInfo.icon;

          return (
            <div key={type} className="tooltip" data-tip={type}>
              <button
                className={`rounded-full p-1 transition-colors ${
                  question.type === type ? "bg-neutral" : "bg-white"
                }`}
                onClick={() => {
                  onTypeChange(type as SurveyQuestionType);
                }}
              >
                <TypeIcon
                  className={`h-6 w-6 ${
                    question.type === type ? "text-white" : "text-neutral"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
