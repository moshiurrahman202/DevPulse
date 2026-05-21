import express, { type Application, type Request, type Response } from "express";
import config from "./config";
const app : Application = express()
app.use(express.json())
app.get('/', (req: Request, res: Response) => {
  res.send('MOSHIUR RAHMAN B7A2 OF DevPulse')
})

app.post("/", async(req: Request, res: Response) => {
  console.log(req.body);
  
})

app.listen(config.port, () => {
  console.log(`Example app listening on port ${config.port}`)
})