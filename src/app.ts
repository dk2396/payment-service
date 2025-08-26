import express from "express";
import routes from "./routes/webhooks";

export const app = express();
app.use(express.json());
app.use(routes);
