import type { NextFunction, Request, Response } from "express";

export const golobalErrorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({
        success: false,
        message: err instanceof Error ? err.message : "Internal Server Error",
        Stack: err instanceof Error? err.stack : undefined
    })
}

