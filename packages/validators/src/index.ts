import z from "zod";
export * from "zod";

export const uuidInput = z.uuid();

export type UUidInput = z.infer<typeof uuidInput>;
