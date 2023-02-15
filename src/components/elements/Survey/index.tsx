import { Popover, RadioGroup } from "@headlessui/react";
import { AttributeType } from "@prisma/client";
import { signIn } from "next-auth/react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { trpc } from "../../../utils/trpc";
import attributes from "../../attributes";
import BooleanAttribute from "../../attributes/Boolean";
import DateAttribute from "../../attributes/Date";
import SurveyQuestionsAttribute, {
  SurveyQuestion,
  SurveyQuestionsAttributeSchema,
} from "../../attributes/SurveyQuestion";
import TextAttribute from "../../attributes/Text";
import SurveyResponseElement, {
  SurveyResponseRequiredAttributes,
} from "../SurveyResponse";
import {
  ElementProps,
  PreAttributeEditFn,
  ElementAttributeDescription,
} from "../utils";
import SurveyResponseTable from "./Table";

export const SurveyRequiredAttributes: ElementAttributeDescription[] = [
  { name: "Title", type: "Text" },
  { name: "Questions", type: "SurveyQuestions" },
  { name: "Deadline", type: "Date" },
  { name: "Anonymous", type: "Boolean" },
];

const SurveyElement = ({ element, edit }: ElementProps) => {
  const userData = trpc.user.getMe.useQuery();
  const utils = trpc.useContext();

  const [viewMode, setViewMode] = useState<"responses" | "questions">(
    "responses"
  );

  const surveyData = trpc.element.get.useQuery(element.id);

  const surveyElement = useMemo(() => {
    return surveyData.data;
  }, [surveyData]);

  const createElement = trpc.element.create.useMutation();

  const user = useMemo(() => {
    return userData.data;
  }, [userData]);

  const titleAttribute = useMemo(() => {
    return surveyElement?.atts.find((attribute) => attribute.name === "Title");
  }, [surveyElement]);

  const questionsAttribute = useMemo(() => {
    return surveyElement?.atts.find(
      (attribute) => attribute.name === "Questions"
    );
  }, [surveyElement]);

  const deadlineAttribute = useMemo(() => {
    return surveyElement?.atts.find(
      (attribute) => attribute.name === "Deadline"
    );
  }, [surveyElement]);

  const anonymousAttribute = useMemo(() => {
    return surveyElement?.atts.find(
      (attribute) => attribute.name === "Anonymous"
    );
  }, [surveyElement]);

  //   Create a SurveyResponse
  const handleCreateResponse = () => {
    if (!surveyElement || !questionsAttribute) return;

    let atts: {
      name: string;
      type: AttributeType;
      value: any;
    }[] = [];

    atts = SurveyResponseRequiredAttributes.map((a) => {
      // Find attribute
      const attInfo = attributes[a.type];
      if (!attInfo) throw new Error("Invalid attribute type");
      return {
        name: a.name,
        type: a.type,
        // For the value, use the default value of the attribute's zod schema
        value: attInfo.valueSchema.parse(undefined),
      };
    });

    // Also add all the questions from the parent survey as attributes,
    // using their schemas to parse the default value
    atts = atts.concat(
      (questionsAttribute.value as SurveyQuestion[]).map((q) => {
        if (!attributes[q.type]) throw new Error("Invalid attribute type");
        return {
          name: q.id,
          type: q.type,
          value: attributes[q.type]!.valueSchema.parse(undefined),
        };
      })
    );

    createElement.mutate(
      {
        parentId: surveyElement.id,
        index: surveyElement.children.length,
        type: "SurveyResponse",
        atts,
      },
      {
        onSuccess: () => {
          utils.element.getAll.invalidate();
          utils.element.get.invalidate(surveyElement.id);
        },
      }
    );
  };

  //   Find amongst SurveyRepsonse children if the user has responded to this survey
  const userSurveyResponseId = useMemo(() => {
    if (!user || !surveyElement) return undefined;

    // Find a child who was created by the current user
    return surveyElement.children.filter((child) => {
      return child.user.id === user.id;
    })[0]?.id;
  }, [surveyElement, user]);

  const userSurveyResponseData = trpc.element.get.useQuery(
    userSurveyResponseId || "",
    { enabled: !!userSurveyResponseId }
  );

  const userSurveyResponse = useMemo(() => {
    return userSurveyResponseData.data;
  }, [userSurveyResponseData]);

  const interact = useMemo(() => {
    if (!element || !user) return false;

    // Check it the user is an admin
    for (const userGroup of user.groups) {
      if (userGroup.name === "Admin") return true;
    }

    // Check if the all group is in the interact groups
    if (element.interactGroups.find((group) => group.name === "All"))
      return true;

    for (const elGroup of element.interactGroups) {
      for (const userGroup of user.groups) {
        if (elGroup.id === userGroup.id) return true;
      }
    }

    return false;
  }, [element, user]);

  const deadlineValid = useMemo(
    () =>
      deadlineAttribute?.value &&
      new Date(deadlineAttribute.value as string) > new Date(),
    [deadlineAttribute]
  );

  const canRespond = useMemo(() => {
    // Both the deadline must not have passed, the user must exist,
    // and must also have interact permissions on the survey
    return surveyElement && user && interact && deadlineValid;
  }, [surveyElement, user, interact, deadlineValid]);

  return titleAttribute && surveyElement ? (
    <div>
      {edit && (
        <div className="flex flex-row flex-wrap space-x-2">
          {/* Popup for creating the survey questions */}
          {questionsAttribute && (
            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button className="flex flex-row items-center space-x-2 rounded-lg bg-primary px-2 py-1 font-semibold text-primary-content hover:bg-primary-focus">
                    <span className="text-sm">Questions</span>
                  </Popover.Button>
                  <Popover.Panel className="absolute top-8 left-0 z-10 flex w-96 flex-col space-y-1 rounded-md border-2 bg-white p-2 text-center">
                    <SurveyQuestionsAttribute
                      attribute={questionsAttribute}
                      edit={edit}
                    />
                  </Popover.Panel>
                </>
              )}
            </Popover>
          )}
          {/* Popup for other general settings */}
          <Popover className="relative">
            {({ open }) => (
              <>
                <Popover.Button className="flex flex-row items-center space-x-2 rounded-lg bg-primary px-2 py-1 font-semibold text-primary-content hover:bg-primary-focus">
                  <span className="text-sm">Settings</span>
                </Popover.Button>
                <Popover.Panel className="absolute top-8 left-0 z-10 flex w-80 flex-col space-y-1 rounded-md border-2 bg-white p-2 text-center">
                  {deadlineAttribute && (
                    <div className="flex flex-row items-center space-x-2">
                      <span className="text-base">Deadline:</span>
                      <DateAttribute
                        attribute={deadlineAttribute}
                        edit={edit}
                        placeholder="Edit survey deadline..."
                      />
                    </div>
                  )}
                  {anonymousAttribute && (
                    <div className="flex flex-row items-center space-x-2">
                      <span className="text-base">Anonymous:</span>
                      <BooleanAttribute
                        attribute={anonymousAttribute}
                        edit={edit}
                      />
                    </div>
                  )}
                </Popover.Panel>
              </>
            )}
          </Popover>
        </div>
      )}
      <TextAttribute
        attribute={titleAttribute}
        size="lg"
        edit={edit}
        placeholder="Edit survey title..."
      />
      {userSurveyResponse && deadlineValid && canRespond && (
        <SurveyResponseElement
          element={userSurveyResponse}
          parent={surveyElement}
          edit={edit}
        />
      )}
      <div className="flex w-full flex-row justify-center">
        {!user && deadlineValid && (
          <button
            className="rounded-full bg-primary px-2 py-1 text-sm font-semibold text-primary-content"
            onClick={() => signIn()}
          >
            Login to respond
          </button>
        )}
        {canRespond && !userSurveyResponse && (
          <button
            className="rounded-full bg-primary px-2 py-1 text-sm font-semibold text-primary-content"
            onClick={handleCreateResponse}
          >
            Respond
          </button>
        )}
        {!deadlineValid && (
          <p className="text-sm font-semibold text-warning">
            No longer recieving responses
          </p>
        )}
      </div>

      {/* Results are shown below */}
      {edit && (
        <div className="mt-2">
          <div className="flex w-full flex-row items-center justify-between border-t-2 py-2">
            <p className="text-xl font-semibold">Responses</p>
            <div className="flex flex-row items-center space-x-2">
              <span className="text-base font-semibold">View mode:</span>
              <RadioGroup value={viewMode} onChange={setViewMode}>
                <RadioGroup.Label className="sr-only">
                  View mode
                </RadioGroup.Label>
                <div className="flex flex-row space-x-2">
                  <RadioGroup.Option value="responses">
                    {({ checked }) => (
                      <span
                        className={`focus:ring-primary-500 relative inline-flex cursor-pointer items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          checked
                            ? "bg-primary text-primary-content"
                            : "bg-primary-100 text-primary"
                        }`}
                      >
                        Responses
                      </span>
                    )}
                  </RadioGroup.Option>
                  <RadioGroup.Option value="questions">
                    {({ checked }) => (
                      <span
                        className={`
                        focus:ring-primary-500 relative inline-flex cursor-pointer items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          checked
                            ? "bg-primary text-primary-content"
                            : "bg-primary-100 text-primary"
                        }`}
                      >
                        Questions
                      </span>
                    )}
                  </RadioGroup.Option>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* View by response */}
          {viewMode === "responses" && questionsAttribute && (
            <div className="flex flex-col space-y-2">
              <SurveyResponseTable
                surveyQuestions={
                  questionsAttribute.value as z.infer<
                    typeof SurveyQuestionsAttributeSchema
                  >
                }
                anonymous={anonymousAttribute?.value as boolean}
                elements={surveyElement.children}
              />
            </div>
          )}
        </div>
      )}
    </div>
  ) : (
    <p>loading survey...</p>
  );
};

export default SurveyElement;

export const surveyPreAttributeEdit: PreAttributeEditFn = async (
  prisma,
  element,
  attribute,
  input
) => {
  // If we are updating the questions in a survey, make sure that the children
  // (i.e. the survey responses) have all the questions as attributes
  if (attribute.type === "SurveyQuestions") {
    const questions = input.value as SurveyQuestion[];

    // Get all the children of the element
    const children = element.children;

    // Loop through all attributes of the children, and remove any that are not in the questions
    // and add any that are not in the children, and check that the types match
    for (const child of children) {
      // Get all the attributes of the child
      const atts = child.atts;

      // Loop through all the attributes of the child
      for (const att of atts) {
        // If the attribute is not in the questions, delete it
        if (!questions.find((q) => q.id === att.name)) {
          await prisma.attribute.delete({
            where: { id: att.id },
          });
        }
      }

      // Loop through all the questions
      for (const question of questions) {
        // If the question is not in the attributes, add it
        if (!atts.find((a) => a.name === question.id)) {
          await prisma.attribute.create({
            data: {
              name: question.id,
              type: question.type,
              value: "",
              element: {
                connect: {
                  id: child.id,
                },
              },
            },
          });
        }
      }

      // Loop through all the attributes of the child
      for (const att of atts) {
        // If the attribute type does not match the question type, update it
        const question = questions.find((q) => q.id === att.name);
        if (question && question.type !== att.type) {
          await prisma.attribute.update({
            where: { id: att.id },
            data: {
              type: question.type,
            },
          });
        }
      }
    }
  }

  return;
};
