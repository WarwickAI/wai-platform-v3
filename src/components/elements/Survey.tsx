import { Popover } from "@headlessui/react";
import { PresentationChartBarIcon } from "@heroicons/react/24/solid";
import { AttributeType } from "@prisma/client";
import { useMemo } from "react";
import { trpc } from "../../utils/trpc";
import SurveyQuestionsAttribute, {
  SurveyQuestion,
} from "../attributes/SurveyQuestion";
import TextAttribute from "../attributes/Text";
import SurveyResponseElement, {
  SurveyResponseRequiredAttributes,
} from "./SurveyResponse";
import { ElementProps, RequiredAttribute } from "./utils";

export const SurveyRequiredAttributes: RequiredAttribute[] = [
  { name: "Title", type: "Text", value: "" },
  { name: "Questions", type: "SurveyQuestions", value: [] },
];

const SurveyElement = ({ element, edit }: ElementProps) => {
  const userData = trpc.user.getMe.useQuery();
  const utils = trpc.useContext();

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

  //   Create a SurveyResponse
  const handleCreateResponse = () => {
    if (!surveyElement || !questionsAttribute) return;

    let atts: {
      name: string;
      type: AttributeType;
      value: string | string[];
      required: boolean;
    }[] = [];

    atts = SurveyResponseRequiredAttributes.map((a) => {
      return { ...a, required: true };
    });

    // Also add all the questions from the parent survey as attributes
    atts = atts.concat(
      (questionsAttribute.value as SurveyQuestion[]).map((q) => {
        return {
          name: q.id,
          type: q.type,
          value: "",
          required: false,
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
  const userSurveyResponse = useMemo(() => {
    if (!user || !surveyElement) return null;

    // Find a child who has a match in users groups and the child's edit groups
    return surveyElement.children.filter((child) => {
      return (
        child.type === "SurveyResponse" &&
        user.groups.some((group) =>
          child.editGroups.map((g) => g.id).includes(group.id)
        )
      );
    })[0];
  }, [surveyElement, user]);

  return titleAttribute && questionsAttribute && surveyElement ? (
    <div>
      <TextAttribute
        attribute={titleAttribute}
        size="md"
        edit={edit}
        placeholder="Edit survey title..."
      />
      {userSurveyResponse && (
        <SurveyResponseElement
          element={userSurveyResponse}
          parent={surveyElement}
        />
      )}
      {!user && <p>Log in to respond to this survey.</p>}
      {!userSurveyResponse && user && (
        <div onClick={handleCreateResponse}>Create Response</div>
      )}
      {/* Popup for creating the survey questions */}
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              className={`flex flex-row items-center space-x-2 rounded-lg px-2 py-1 font-semibold hover:bg-slate-200 ${
                open ? "outline-2" : "outline-none"
              }`}
            >
              <span className="text-sm">Questions</span>
            </Popover.Button>
            <Popover.Panel className="absolute top-10 left-0 z-10 flex flex-col space-y-1 rounded-md border-2 bg-white p-2 text-center">
              <SurveyQuestionsAttribute
                attribute={questionsAttribute}
                edit={edit}
              />
            </Popover.Panel>
          </>
        )}
      </Popover>
    </div>
  ) : (
    <p>loading survey...</p>
  );
};

export default SurveyElement;
