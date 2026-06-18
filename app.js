import express from "express";
import cookieParser from "cookie-parser";
const app = express();

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
// View Engine
app.set("view engine", "ejs");

// Routes
import userRoutes from "./src/routes/user.routes.js";

app.use("/user", userRoutes);
export { app };
