import z from "zod";


export const createUserWithEmailAndPasswordInput = z.object({
    fullName: z.string().describe('full name of the user'),
    email: z.email().describe("email of the user"),
    password: z.string().min(6).describe("user password")
})

export type CreateUserWithEmailAndPasswordInputType = z.infer<typeof createUserWithEmailAndPasswordInput>


export const generateUserTokenPayload = z.object({
    userId: z.uuid().describe("id of the user")
})


export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>