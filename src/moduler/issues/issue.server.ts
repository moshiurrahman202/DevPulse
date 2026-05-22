import type { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import { pool } from "../../db";
import sendResponse from "../../utility/sendResponse";
import type { TIssue } from "./issue.interface";
const createIssueIntoDB= async(payload: TIssue, user: JwtPayload) => {
    const {title, description, type} = payload;
    const result = await pool.query(`
        INSERT INTO issues(title, description, type, reporter_id)VALUES($1,$2,$3,$4) RETURNING *
        `,[title, description,type, user.id]);
        return result;
}
export const issueService = {
    createIssueIntoDB,
}