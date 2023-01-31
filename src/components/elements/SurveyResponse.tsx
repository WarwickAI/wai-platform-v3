import { useMemo } from "react";
import { PresentationChartBarIcon } from "@heroicons/react/24/solid";
import { trpc } from "../../utils/trpc";
import {
  ElementCreateCheckPermsFn,
  ElementProps,
  PreElementCreationFn,
  RequiredAttribute,
} from "./utils";
import { SurveyQuestion } from "../attributes/SurveyQuestion";
import TextAttribute from "../attributes/Text";
import DateAttribute from "../attributes/Date";

export const SurveyResponseRequiredAttributes: RequiredAttribute[] = [];

export const SurveyResponseDescription = "A user's survey response.";

export const SurveyResponseIcon = PresentationChartBarIcon;

// This element is only used within the Survey element, so it doesn't need to be
// as rigorous as other elements.
const SurveyResponseElement = ({ element, parent }: ElementProps) => {
  const utils = trpc.useContext();

  const deleteElement = trpc.element.delete.useMutation({
    onSuccess: () => {
      utils.element.getAll.invalidate();
      utils.element.get.invalidate(parent?.id || "");
    },
  });

  const userData = trpc.user.getMe.useQuery();

  const user = useMemo(() => {
    return userData.data;
  }, [userData]);

  // If the parent (which is a Survey) contains questions in its SurveyQuestions attribute,
  // that do not exist as an attribute in this element, then add them.
  const surveyQuestionsAttribute = useMemo(() => {
    return parent?.atts.find((att) => att.name === "Questions");
  }, [parent]);

  const edit = useMemo(() => {
    if (!element || !user) return false;

    // Check it the user is an admin
    for (const userGroup of user.groups) {
      if (userGroup.name === "Admin") return true;
    }

    for (const elGroup of element.editGroups) {
      for (const userGroup of user.groups) {
        if (elGroup.id === userGroup.id) return true;
      }
    }
    return false;
  }, [element, user]);

  return (
    <div>
      <p>Some Response</p>
      <div onClick={() => deleteElement.mutate({ id: element.id })}>Delete</div>
      {edit &&
        surveyQuestionsAttribute &&
        (surveyQuestionsAttribute.value as SurveyQuestion[]).map((q) => {
          // Check if the question exists as an attribute
          const questionAttribute = element.atts.find(
            (att) => att.name === q.id
          );

          if (!questionAttribute) {
            console.log("Question attribute does not exist");
            return null;
          }

          if (q.type !== questionAttribute.type) {
            console.log("Question type does not match attribute type");
            return null;
          }

          return (
            <div key={q.id}>
              <p>{q.text}</p>
              {q.type === "Text" && (
                <TextAttribute
                  attribute={questionAttribute}
                  edit={edit}
                  size="sm"
                />
              )}
              {q.type === "Date" && (
                <DateAttribute attribute={questionAttribute} edit={edit} />
              )}
            </div>
          );
        })}
    </div>
  );
};

export default SurveyResponseElement;

export const surveyResponseCreateCheckPerms: ElementCreateCheckPermsFn = async (
  primsa,
  user,
  input,
  parent
) => {
  // Only care about adding a new survey.
  // This should be allowed if the user can interact with the parent element.
  if (input.type !== "SurveyResponse" || !user || !parent) return;

  // Check if the user can interact with the parent element
  if (
    user.groups.some((g) =>
      parent.interactGroups.map((g2) => g2.id).includes(g.id)
    ) ||
    parent.interactGroups.find((g) => g.name === "All")
  ) {
    return true;
  }

  return;
};

export const surveyResponsePreCreate: PreElementCreationFn = async (
  prisma,
  input,
  user,
  perms
) => {
  // Make sure to add the user's group with edit perms

  if (!user || !user.email) return;

  let userGroup = await prisma.group.findFirst({
    where: {
      name: user.email,
    },
  });

  // If doesn't exists, create
  if (!userGroup) {
    userGroup = await prisma.group.create({
      data: {
        name: user.email,
        users: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  // Add the user's group to the view, interact and edit groups
  perms.view.push(userGroup);
  perms.interact.push(userGroup);
  perms.edit.push(userGroup);

  return {
    input,
    perms,
  };
};
