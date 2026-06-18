/**
 * Middleware to verify whether the user is logged in.
 * If the username cookie is missing, redirect the user to the login page.
 * Otherwise, allow the request to continue to the next route handler.
 */

import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyUser = async (req, res, next) => {
  console.log("Middleware Running");

  const token = req.cookies.accessToken;

  console.log("Token:", token);

  //   const username = req.cookies.username;

  if (!token) {
    return res.redirect("/user/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded:", decoded);
    const user = await User.findById(decoded._id).select("-password");
    req.user = user;
    next();
  } catch (error) {
    return res.redirect("/user/login");
  }
};
