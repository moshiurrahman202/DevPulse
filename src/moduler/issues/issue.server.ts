import type { JwtPayload } from "jsonwebtoken";
import { pool } from "../../db";
import type { TIssue, TIssueQuery } from "./issue.interface";

const createIssueIntoDB= async(payload: TIssue, user: JwtPayload) => {
    const {title, description, type} = payload;
    const result = await pool.query(`
        INSERT INTO issues(title, description, type, reporter_id)VALUES($1,$2,$3,$4) RETURNING *
        `,[title, description,type, user.id]);
        return result;
}

// start to get all issues by filter or short
const getAllIssuesFromDB = async (query: TIssueQuery) => {
  const { sort = "newest", type, status } = query;

  let findQuery = `SELECT * FROM issues`;
  const conditions: string[] = [];
  const values: string[] = [];

  // filter => type
  if (type) {
    conditions.push(`type = $${values.length + 1}`);
    values.push(type);
  }

  // filter status
  if (status) {
    conditions.push(`status = $${values.length + 1}`);
    values.push(status);
  }

  if (conditions.length > 0) {
    findQuery += ` WHERE ${conditions.join(" AND ")}`;
  }

  // filter short
  if (sort === "oldest") {
    findQuery += ` ORDER BY created_at ASC`;
  } else {
    findQuery += ` ORDER BY created_at DESC`;
  }

  // get issues
  const issuesResult = await pool.query(findQuery, values);
  // console.log(issuesResult);
  const issues = issuesResult.rows;

  if (issues.length === 0) return [];

  // collect all id
  const reporterId = [...new Set(issues.map((item) => item.reporter_id))];


  // get users in batch
  const usersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [reporterId]
  );

  const userMap = new Map();

  usersResult.rows.forEach((user) => {
    userMap.set(user.id, user);
  });

  // for return attach reporter
  const result = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: userMap.get(issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));

  return result;
};
// ene of get all filter data


const getSingleIssueFormDB = async (id: string) => {
  const issueData = await pool.query(`
    SELECT * FROM issues WHERE id=$1
    `,[id]);
    
    if(issueData.rows.length === 0){
      throw new Error("Issue Not Found!")
    }
    const issue = issueData.rows[0];
    const userData = await pool.query(`
      SELECT * FROM users WHERE id=$1
      `,[issue.reporter_id]);
      const user = userData.rows[0];
  
    const result = {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      created_at: issue.created_at,
      updated_at: issue.updated_at
    }
    return result;

}


const updateIssueIntoDB = async(id:string,payload:TIssue, user:JwtPayload) => {
   const { title, description, type } = payload;
    const issueData = await pool.query(`
     SELECT * FROM issues WHERE id=$1
     `,[id]);
     if(issueData.rows.length === 0){
      throw new Error("Issue not found!");
    }
    const issue = issueData.rows[0];

    if(user.role === "contributor" && issue.reporter_id  !== user.id){
      throw new Error("Contributor can update own issue!");
    }
    if(issue.status !== "open"){
      throw new Error("Update only if status is open!");
    }
    const result = await pool.query(`
      UPDATE issues SET title=COALESCE($1, title),
      description=COALESCE($2, description),
      type=COALESCE($3, type),
      updated_at= NOW() WHERE id=$4 RETURNING *
      `,[title, description, type, id]);
      return result;

}
const deleteIssueFromDB = async (id: string) => {
  const result = await pool.query(`
    SELECT * FROM issues WHERE id=$1
    `, [id]);
    if(result.rows.length === 0){
      throw new Error("Issue not found")
    }
    await pool.query(`
      DELETE FROM issues WHERE id=$1
      `,[id])
}
export const issueService = {
    createIssueIntoDB,
    getAllIssuesFromDB,
    getSingleIssueFormDB,
    updateIssueIntoDB,
    deleteIssueFromDB
}