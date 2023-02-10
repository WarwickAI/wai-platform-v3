import { AttributeType } from "@prisma/client";
import React from "react";
import { z } from "zod";
import { AttributeProps } from "../utils";

export const ColumnSchema = z.object({
  name: z.string(),
  type: z.nativeEnum(AttributeType),
  value: z.any().optional(),
});

export const ColumnAttributeSchema = z.array(ColumnSchema).default([]);

const ColumnAttribute = ({}: AttributeProps) => {
  return <>Header not implemented</>;
};

export default ColumnAttribute;
