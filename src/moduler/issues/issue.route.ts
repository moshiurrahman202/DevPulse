import { Router } from "express";
import { issueControler } from "./issue.controller";
import auth from "../../middleware/auth";

const router = Router();
router.post("/",auth("contributor"), issueControler.createIssue);
export const issueRoute = router;