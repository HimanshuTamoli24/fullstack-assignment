import { CookieOptions, Response, Request } from "express"
import { TRPCContext } from "../context"


const defaultCookieOption: CookieOptions = {
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
}

export function createCookieFactory(res: Response){

    return function createCookie(
        name: string,
        value:string,
        opts: CookieOptions = defaultCookieOption
    ){

        res.cookie(name, value, opts)

    }

}
export function clearCookieFactory(res: Response){

    return function clearCookie(
        name: string,
    ){

        res.clearCookie(name)

    }

}
export function getCookieFactory(req: Request){

    return function getCookie(
        name: string,
    ){

        return req.cookies?.[name]

    }

}



export  function setAuthenticationCookie(ctx: TRPCContext, accessToken: string){
    ctx.createCookie("accessToken", accessToken)
}

export function clearAuthenticationCookie(ctx: TRPCContext){
    ctx.clearCookie("accessToken")
}

export function getAuthenticationCookie(ctx: TRPCContext){
    return ctx.getCookie("accessToken")
}
