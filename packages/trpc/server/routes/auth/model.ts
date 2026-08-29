import z from "zod";


export const createUserWithEmailAndPasswordInputModel = z.object({
    fullName: z.string().describe('full name of the user'),
    email: z.email().describe("email of the user"),
    password: z.string().min(6).describe("user password")
})

export const createUserWithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe("id of the user created")
})