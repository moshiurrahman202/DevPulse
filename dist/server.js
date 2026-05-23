

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/moduler/auth/auth.router.ts
import { Router } from "express";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string_of_db: process.env.CONNECTIONSTRINGOFDB,
  port: process.env.PORT,
  secret: process.env.SECRET
};
var config_default = config;

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.connection_string_of_db
});
var initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'contributor'
            CHECK (role IN ('contributor', 'maintainer')),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
            `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL
        CHECK (LENGTH(description) >= 20),
        type VARCHAR(20) NOT NULL
        CHECK (type IN ('bug', 'feature_request')),
        status VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'resolved')),
        reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )  
        `);
    console.log("Database connected successfully!");
  } catch (error) {
    console.log("this is from db/index.ts", error);
  }
};

// src/moduler/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
var createUserIntuDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(`
        INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,COALESCE($4, 'contributor')) RETURNING *
        `, [name, email, hashPassword, role]);
  delete result.rows[0].password;
  return result;
};
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `, [email]);
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }
  const user = userData.rows[0];
  const compareUserPass = await bcrypt.compare(password, user.password);
  if (!compareUserPass) {
    throw new Error("Invalid Credentials!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const accessToken = jwt.sign(jwtPayload, config_default.secret, {
    expiresIn: "7d"
  });
  delete user.password;
  return {
    token: accessToken,
    user
  };
};
var authService = {
  createUserIntuDB,
  loginUserIntoDB
};

// src/moduler/auth/auth.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await authService.createUserIntuDB(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(201).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    res.status(201).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  createUser,
  loginUser
};

// src/moduler/auth/auth.router.ts
var router = Router();
router.post("/signup", authController.createUser);
router.post("/login", authController.loginUser);
var authRoute = router;

// src/moduler/issues/issue.route.ts
import { Router as Router2 } from "express";

// src/moduler/issues/issue.server.ts
var createIssueIntoDB = async (payload, user) => {
  const { title, description, type } = payload;
  const result = await pool.query(`
        INSERT INTO issues(title, description, type, reporter_id)VALUES($1,$2,$3,$4) RETURNING *
        `, [title, description, type, user.id]);
  return result;
};
var getAllIssuesFromDB = async (query) => {
  const { sort = "newest", type, status } = query;
  let findQuery = `SELECT * FROM issues`;
  const conditions = [];
  const values = [];
  if (type) {
    conditions.push(`type = $${values.length + 1}`);
    values.push(type);
  }
  if (status) {
    conditions.push(`status = $${values.length + 1}`);
    values.push(status);
  }
  if (conditions.length > 0) {
    findQuery += ` WHERE ${conditions.join(" AND ")}`;
  }
  if (sort === "oldest") {
    findQuery += ` ORDER BY created_at ASC`;
  } else {
    findQuery += ` ORDER BY created_at DESC`;
  }
  const issuesResult = await pool.query(findQuery, values);
  const issues = issuesResult.rows;
  if (issues.length === 0) return [];
  const reporterId = [...new Set(issues.map((item) => item.reporter_id))];
  const usersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [reporterId]
  );
  const userMap = /* @__PURE__ */ new Map();
  usersResult.rows.forEach((user) => {
    userMap.set(user.id, user);
  });
  const result = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: userMap.get(issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return result;
};
var getSingleIssueFormDB = async (id) => {
  const issueData = await pool.query(`
    SELECT * FROM issues WHERE id=$1
    `, [id]);
  if (issueData.rows.length === 0) {
    throw new Error("Issue Not Found!");
  }
  const issue = issueData.rows[0];
  const userData = await pool.query(`
      SELECT * FROM users WHERE id=$1
      `, [issue.reporter_id]);
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
  };
  return result;
};
var updateIssueIntoDB = async (id, payload, user) => {
  const { title, description, type } = payload;
  const issueData = await pool.query(`
     SELECT * FROM issues WHERE id=$1
     `, [id]);
  if (issueData.rows.length === 0) {
    throw new Error("Issue not found!");
  }
  const issue = issueData.rows[0];
  if (user.role === "contributor" && issue.reporter_id !== user.id) {
    throw new Error("Contributor can update own issue!");
  }
  if (issue.status !== "open") {
    throw new Error("Update only if status is open!");
  }
  const result = await pool.query(`
      UPDATE issues SET title=COALESCE($1, title),
      description=COALESCE($2, description),
      type=COALESCE($3, type),
      updated_at= NOW() WHERE id=$4 RETURNING *
      `, [title, description, type, id]);
  return result;
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(`
    SELECT * FROM issues WHERE id=$1
    `, [id]);
  if (result.rows.length === 0) {
    throw new Error("Issue not found");
  }
  await pool.query(`
      DELETE FROM issues WHERE id=$1
      `, [id]);
};
var issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFormDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/moduler/issues/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const result = await issueService.createIssueIntoDB(req.body, req.user);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issueService.getAllIssuesFromDB(req.query);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrived successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFormDB(id);
    if (!result) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "User Not found!"
      });
    }
    ;
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrived successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
  ;
};
var updateIssue = async (req, res) => {
  try {
    const result = await issueService.updateIssueIntoDB(req.params.id, req.body, req.user);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    await issueService.deleteIssueFromDB(req.params.id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var issueControler = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access!"
        });
      }
      const decoded = jwt2.verify(token, config_default.secret);
      const userData = await pool.query(`
            SELECT * FROM users WHERE id=$1`, [decoded.id]);
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "user not found!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "forbidden this roke have no access!"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/moduler/issues/issue.route.ts
var router2 = Router2();
router2.post("/", auth_default("contributor", "maintainer"), issueControler.createIssue);
router2.get("/", issueControler.getAllIssues);
router2.get("/:id", issueControler.getSingleIssue);
router2.patch("/:id", auth_default("contributor", "maintainer"), issueControler.updateIssue);
router2.delete("/:id", auth_default("maintainer"), issueControler.deleteIssue);
var issueRoute = router2;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err instanceof Error ? err.message : "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.send("MOSHIUR RAHMAN B7A2 OF DevPulse");
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = async () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map