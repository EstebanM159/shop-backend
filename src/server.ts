import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma"; // según tu output

const prisma = new PrismaClient();
dotenv.config();
const app = express();
export default app;
dotenv;
