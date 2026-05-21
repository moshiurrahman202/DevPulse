import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  connection_string_of_db: process.env.CONNECTIONSTRINGOFDB,
  port: process.env.PORT,
  // secret : process.env.JWT_SECRET
};

export default config;