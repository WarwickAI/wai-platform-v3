import { AttributeType, ElementType } from "@prisma/client";
import { z } from "zod";

export const ElementCreateInputSchema = z.object({
  type: z.nativeEnum(ElementType),
  index: z.number(),
  parentId: z.string().nullish(),
  atts: z
    .object({
      name: z.string(),
      type: z.nativeEnum(AttributeType),
      value: z.string().or(z.number()).or(z.boolean()).or(z.any().array()),
    })
    .array(),
});

export type ElementCreateInputType = z.infer<typeof ElementCreateInputSchema>;

export const AttributeEditInputSchema = z.object({
  id: z.string(),
  value: z.string().or(z.any().array()),
});

export type AttributeEditInputType = z.infer<typeof AttributeEditInputSchema>;
