import { PresentationChartBarIcon } from "@heroicons/react/24/solid";
import { AttributeType } from "@prisma/client";
import { useMemo } from "react";
import { trpc } from "../../utils/trpc";
import TextAttribute from "../attributes/Text";
import SurveyResponseElement, {
  SurveyResponseRequiredAttributes,
} from "./SurveyResponse";
import { ElementProps, RequiredAttribute } from "./utils";

export const SurveyRequiredAttributes: RequiredAttribute[] = [
  { name: "Title", type: "Text", value: "" },
  { name: "Questions", type: "SurveyQuestions", value: [] },
];

export const SurveyDescription = "A survey element, with questions.";

export const SurveyIcon = PresentationChartBarIcon;

const SurveyElement = ({ element, edit }: ElementProps) => {
  const userData = trpc.user.getMe.useQuery();

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
  const handleCreateRepsonse = () => {
    if (!surveyElement) return;

    let atts: {
      name: string;
      type: AttributeType;
      value: string | string[];
      required: boolean;
    }[] = [];

    atts = SurveyResponseRequiredAttributes.map((a) => {
      return { ...a, required: true };
    });

    createElement.mutate({
      parentId: surveyElement.id,
      index: surveyElement.children.length,
      type: "SurveyResponse",
      atts,
    });
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

  return titleAttribute && questionsAttribute ? (
    <div>
      <TextAttribute
        attribute={titleAttribute}
        size="md"
        edit={edit}
        placeholder="Edit survey title..."
      />
      {userSurveyResponse && (
        <SurveyResponseElement element={userSurveyResponse} edit={edit} />
      )}
      {!user && <p>Log in to respond to this survey.</p>}
      {!userSurveyResponse && user && (
        <div onClick={handleCreateRepsonse}>Create Response</div>
      )}
    </div>
  ) : (
    <p>loading survey...</p>
  );
};

export default SurveyElement;
