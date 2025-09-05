import express from "express";
import contentRouter from "./content";

const app = express();

app.use("/content", contentRouter);

export default app;
