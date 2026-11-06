import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "trailmate-3d": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        layout?: string;
        fit?: string;
      };
    }
  }
}
