import { PresentationChartBarIcon } from "@heroicons/react/24/solid";
import { trpc } from "../../utils/trpc";
import { ElementWithAttsGroups, RequiredAttribute } from "./utils";

export const SurveyResponseRequiredAttributes: RequiredAttribute[] = [];

export const SurveyResponseDescription = "A user's survey response.";

export const SurveyResponseIcon = PresentationChartBarIcon;

// This element is only used within the Survey element, so it doesn't need to be
// as rigorous as other elements.
const SurveyResponseElement = ({
  element,
  edit,
}: {
  element: ElementWithAttsGroups;
  edit: boolean;
}) => {
  const deleteElement = trpc.element.delete.useMutation();

  return (
    <div>
      {element.atts.map((att) => (
        <p key={att.id}>{att.name}</p>
      ))}
      <p>Some Response</p>
      <div onClick={() => deleteElement.mutate({ id: element.id })}>Delete</div>
    </div>
  );
};

export default SurveyResponseElement;
