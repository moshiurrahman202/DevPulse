import type { Response } from "express"
export const sendResponse = <T>(res:Response, {message, data, error}: {message: string; data?: T; error: boolean;
}, status: 200) => {
res.status(status).json({
    succrss: error? false: true,
    message: message,
    data:error? undefined : data
})
}