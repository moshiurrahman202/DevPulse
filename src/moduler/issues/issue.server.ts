import type { JwtPayload } from "jsonwebtoken";
import { pool } from "../../db";

import type { TIssue } from "./issue.interface";
const createIssueIntoDB= async(payload: TIssue, user: JwtPayload) => {
    const {title, description, type} = payload;
    const result = await pool.query(`
        INSERT INTO issues(title, description, type, reporter_id)VALUES($1,$2,$3,$4) RETURNING *
        `,[title, description,type, user.id]);
        return result;
}

const getAllIssuesFromDB = async (query: any) => {
  const { sort = "newest", type, status } = query;

  let sql = `SELECT * FROM issues`;
  const conditions: string[] = [];
  const values: any[] = [];

  // FILTER: type
  if (type) {
    conditions.push(`type = $${values.length + 1}`);
    values.push(type);
  }

  // FILTER: status
  if (status) {
    conditions.push(`status = $${values.length + 1}`);
    values.push(status);
  }

  if (conditions.length) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }

  // SORT
  if (sort === "oldest") {
    sql += ` ORDER BY created_at ASC`;
  } else {
    sql += ` ORDER BY created_at DESC`;
  }

  // STEP 1: get issues
  const issuesResult = await pool.query(sql, values);
  const issues = issuesResult.rows;

  if (issues.length === 0) return [];

  // STEP 2: collect reporter ids
  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];

  // STEP 3: fetch users in batch
  const usersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [reporterIds]
  );

  const userMap = new Map();
  usersResult.rows.forEach((user) => {
    userMap.set(user.id, user);
  });

  // STEP 4: attach reporter
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

export const issueService = {
    createIssueIntoDB,
    getAllIssuesFromDB,
}