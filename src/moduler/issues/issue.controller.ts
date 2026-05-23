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
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrived successfully",
      data:result
    });

  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error
    })
  }
};

const getSingleIssue = async(req: Request, res:Response)=> {
  const {id} = req.params;
  try {
    const result = await issueService.getSingleIssueFormDB(id as string);
    if(!result) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User Not found!",
      })
    };
    sendResponse(res,{
      statusCode: 200,
      success: true,
      message: "Issue retrived successfully",
      data:result
    })
  } catch (error:any) {
    sendResponse(res,{
      statusCode: 500,
      success:false,
      message: error.message,
      error: error
    })
  };
};

const updateIssue = async (req: Request, res:Response) => {
  try {
    const result = await issueService.updateIssueIntoDB(req.params.id as string, req.body, req.user as JwtPayload);
    sendResponse(res,{
      statusCode: 200,
      success:true,
      message: "Issue updated successfully",
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
}

const deleteIssue = async (req: Request, res:Response) => {
  try {
    await issueService.deleteIssueFromDB(req.params.id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    })
    
  } catch (error:any) {
    sendResponse(res,{
      statusCode: 500,
      success:false,
      message:error.message,
      error: error
    })  
  }
}
export const issueControler = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue
}