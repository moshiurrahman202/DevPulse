import config from "../../config";
import { pool } from "../../db";
import type { TLogin, TUser } from "./auth.interface";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const createUserIntuDB = async(payload: TUser) => {
    const {name, email, password, role} = payload;
    const hashPassword = await bcrypt.hash(password,10);
    const result = await pool.query(`
        INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,$4) RETURNING *
        `,[name, email, hashPassword, role]);
        delete result.rows[0].password;
        return result;
};

const loginUserIntoDB = async(payload: TLogin) =>  {
    const {email, password} = payload;
    const userData = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `,[email]);
        // check user exists or not
        if(userData.rows.length === 0){
            throw new Error("Invalid Credentials!")
        }
        // compare the password
        const user = userData.rows[0];
        const  compareUserPass = await bcrypt.compare(password, user.password);
        if(!compareUserPass){
            throw new Error("Invalid Credentials!");
        }
        // generate token
        const jwtPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        const accessToken = jwt.sign(jwtPayload,config.secret as string, {
            expiresIn: "7d"
        });
        delete user.password;
        return{
            token: accessToken,
            user: user
        }

} 
export const authService = {
    createUserIntuDB,
    loginUserIntoDB
}