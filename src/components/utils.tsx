import { SVGProps } from "react";

export type CustomIcon = (
  props: SVGProps<SVGSVGElement> & {
    title?: string | undefined;
    titleId?: string | undefined;
  }
) => JSX.Element;
