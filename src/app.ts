import express, { type Application, type Request, type Response } from "express";
import { authRoute } from "./moduler/auth/auth.router";
const app : Application = express()
app.use(express.json())
app.get('/', (req: Request, res: Response) => {
  res.send('MOSHIUR RAHMAN B7A2 OF DevPulse')
})

app.post("/", async(req: Request, res: Response) => {
  console.log(req.body);
  
});

app.use("/api/auth",authRoute);
export default app;