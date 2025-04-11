import express from 'express'
import { config } from 'dotenv';

config({
  path:"/.env"
})
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export {app}