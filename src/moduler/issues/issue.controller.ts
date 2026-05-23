import type { Request, Response } from "express";
import { issueService } from "./issue.server";
import type { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utility/sendResponse";

const createIssue = async(req: Request, res: Response) => {
    try {
        const result = await issueService.createIssueIntoDB(req.body,req.user as JwtPayload);
        sendResponse(res, {
          statusCode: 201,
          success: true,
          message: "Issue created successfully",
          data: result.rows[0]
        })
    } catch (error:any) {
      sendResponse(res, {
        statusCode: 500,
        success: false,
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

const getSingleIssue = async(req: Request, res:Response)=> {
  const {id} = req.params;
  try {
    const result = await issueService.getSingleIssueFormDB(id as string);
    if(!result) {
      res.status(404).json({
        success: false,
        message: "User Not found!",
        data: {},
      });
    };
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error:any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  };
};

const updateIssue = async (req: Request, res:Response) => {
  try {
    const result = await issueService.updateIssueIntoDB(req.params.id as string, req.body, req.user as JwtPayload);
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0],
    });
  } catch (error:any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

const deleteIssue = async (req: Request, res:Response) => {
  try {
    await issueService.deleteIssueFromDB(req.params.id as string);
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
    
  } catch (error:any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error
    });

    
  }
}
export const issueControler = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue
}