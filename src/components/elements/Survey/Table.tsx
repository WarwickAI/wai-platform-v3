import { z } from "zod";
import attributes from "../../attributes";
import { SurveyQuestionsAttributeSchema } from "../../attributes/SurveyQuestion";
import { ElementWithAttsGroups } from "../utils";

type SurveyResponseTableProps = {
  surveyQuestions: z.infer<typeof SurveyQuestionsAttributeSchema>;
  elements: ElementWithAttsGroups[];
  anonymous: boolean;
};

const SurveyResponseTable = ({
  surveyQuestions,
  elements,
  anonymous,
}: SurveyResponseTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="table-compact w-full">
        <thead>
          <tr className="bg-gray-200">
            {!anonymous && <th>User</th>}
            {surveyQuestions.map((question) => (
              <th key={question.id}>{question.text}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {elements.map((element) => (
            <tr key={element.id}>
              {!anonymous && (
                <td className="border-r border-r-gray-300">
                  {element.user?.email}
                </td>
              )}
              {surveyQuestions.map((question) => {
                const att = element.atts.find(
                  (att) => att.name === question.id
                );

                if (!att) return null;

                const AnswerElement = attributes[att.type]?.element;

                if (!AnswerElement) return null;

                return (
                  <td
                    key={element.id + att.name}
                    className="border-r border-r-gray-300"
                  >
                    <AnswerElement attribute={att} edit={false} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SurveyResponseTable;
