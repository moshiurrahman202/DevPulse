import express, { type Application, type Request, type Response } from "express";
import { authRoute } from "./moduler/auth/auth.router";
import { issueRoute } from "./moduler/issues/issue.route";
const app : Application = express()
app.use(express.json())
app.get('/', (req: Request, res: Response) => {
  res.send('MOSHIUR RAHMAN B7A2 OF DevPulse')
})

app.post("/", async(req: Request, res: Response) => {
  console.log(req.body);
  
});

app.use("/api/auth",authRoute);

app.use("/api/issues", issueRoute)
export default app;