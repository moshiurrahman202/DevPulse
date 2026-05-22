import { Router } from "express";
import { issueControler } from "./issue.controller";
import auth from "../../middleware/auth";

const router = Router();
router.post("/",auth("contributor","maintainer"), issueControler.createIssue);
router.get("/", issueControler.getAllIssues);
export const issueRoute = router;