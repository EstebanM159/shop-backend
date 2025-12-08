import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';

dotenv.config();
const app = express();
// app.use(cors(corsConfig));
app.use(cookieParser());
app.use(fileUpload());
export default app;
dotenv;
