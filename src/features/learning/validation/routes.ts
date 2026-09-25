import { z } from "zod";

export const pathSlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const lessonSlugSchema = pathSlugSchema;
export const chapterIdSchema = z.uuid();
export const lessonIdSchema = z.uuid();
