import express, { type Application, type Request, type Response } from "express";
import { authRoute } from "./moduler/auth/auth.router";
import { issueRoute } from "./moduler/issues/issue.route";
import globalErrorHandler from "./middleware/globalErrorHandler";
const app : Application = express();
app.use(express.json());
app.get('/', (req: Request, res: Response) => {
  res.send('MOSHIUR RAHMAN B7A2 OF DevPulse');
});

app.use("/api/auth",authRoute);
app.use("/api/issues", issueRoute);
app.use(globalErrorHandler);

export default app;