import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * User registration controller.
 * Creates a new user in the database and sends success response.
 */
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  console.log("Request Body:", req.body);
  const existedUser = await User.findOne({
    email,
  });

  if (existedUser) {
    return res.send("User already exists");
    res.redirect("/user/login");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  console.log("Created User:", user);

  // res.send("Registration Success");
  return res.redirect("/user/dashboard");
};

/**
 * User login controller.
 * Finds user by email, verifies password, sets cookie, and redirects to dashboard.
 */
export const Login = async (req, res) => {
  console.log("Login Body:", req.body);

  const { email, password } = req.body;
  const user = await User.findOne({ email });

  console.log("user from DB Found:", user);

  if (!user) {
    return res.send("User Not Found");
  }

  const existingUser = await user.isPasswordCorrect(password);

  console.log("Password Match:", existingUser);

  if (existingUser) {
    // res.send("Login Success");
    // res.cookie("username", user.name);

    // console.log("Cookie Set:", user.name);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
      validateBeforeSave: false,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
    });

    return res.redirect("/user/dashboard");
  } else {
    res.send("Wrong Password");
  }
};

export const logout = (req, res) => {
  res.clearCookie("accessToken");

  res.redirect("/user/login");
};

export const refreshAccessToken = async (req, res) => {
  const incomingRefreshingToken = req.cookies.refreshToken;

  if (!incomingRefreshingToken) {
    return res.status(401).send("Refresh Token Missing");
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshingToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    console.log("Decoded:", decoded);

    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).send("User Not Found");
    }

    if (incomingRefreshingToken !== user.refreshToken) {
      return res.status(401).send("Invalid Refresh Token");
    }

    const newAccessToken = user.generateAccessToken();

    console.log("New Access Token:", newAccessToken);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
    });

    return res.send("Access Token Refreshed");
  } catch (error) {
    console.log("Refresh Error:", error.message);

    return res.status(401).send(error.message);
  }
};

/**
 * Renders the registration page.
 */
export const showRegister = (req, res) => {
  res.render("register");
};

/**
 * Renders the login page.
 */
export const showLogin = (req, res) => {
  res.render("login");
};

/**
 * Renders the user dashboard page.
 * Reads the username from the cookie and passes it to the view.
 */
export const dashboard = (req, res) => {
  console.log("User Data:", req.user);
  // console.log("Cookies:", req.cookies);

  const username = req.user.name;
  const userEmail = req.user.email;

  console.log("Username:", username);
  res.render("dashboard", { username, userEmail });
};
