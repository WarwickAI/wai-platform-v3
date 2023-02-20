import { Attribute } from "@prisma/client";
import { z } from "zod";
import { STVResults } from "../../attributes/STV";
import { SurveyQuestionsAttributeSchema } from "../../attributes/SurveyQuestion";
import { ElementWithAttsGroups } from "../utils";

type QuestionResponseProps = {
  surveyQuestions: z.infer<typeof SurveyQuestionsAttributeSchema>;
  elements: ElementWithAttsGroups[];
  anonymous: boolean;
};

const QuestionResponses = ({
  surveyQuestions,
  elements,
  anonymous,
}: QuestionResponseProps) => {
  return (
    <div className="flex flex-col space-y-2">
      {surveyQuestions.map((question) => (
        <div key={question.id} className="flex flex-col space-y-2">
          <p className="text-lg font-semibold">{question.text}</p>
          <div className="flex flex-col space-y-2">
            {question.type === "STV" && (
              <STVResults
                stvAttributes={
                  elements
                    .map((element) => {
                      const att = element.atts.find(
                        (att) => att.name === question.id
                      );
                      if (!att) return null;
                      return att;
                    })
                    .filter((att) => att !== null) as Attribute[]
                }
                dbRef={question.ref || ""}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionResponses;
