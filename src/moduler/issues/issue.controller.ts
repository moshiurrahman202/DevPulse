import type { Request, Response } from "express";
import { issueService } from "./issue.server";
import type { JwtPayload } from "jsonwebtoken";
// import sendResponse from "../../utility/sendResponse";

const createIssue = async(req: Request, res: Response) => {
    try {
        // console.log("thr =>",req.user);
        const result = await issueService.createIssueIntoDB(req.body,req.user as JwtPayload)
        res.status(201).json({
            success:true,
            message: "Issue created successfully",
            data: result.rows[0]
        })
    } catch (error:any) {
         res.status(201).json({
            success:true,
            message: error.message,
            error: error
        })
    }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await issueService.getAllIssuesFromDB(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const issueControler = {
    createIssue,
    getAllIssues,
}