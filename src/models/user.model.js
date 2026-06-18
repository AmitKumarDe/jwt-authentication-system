import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// User schema defines the structure of data stored in the users collection.
const userSchema = new Schema({
  // User's display name, required for every user.
  name: {
    type: String,
    required: true,
  },

  // User's email address, required and unique to prevent duplicate accounts.
  email: {
    type: String,
    required: true,
    unique: true,
  },

  // User's password. It is hashed before saving to the database.
  password: {
    type: String,
    required: true,
  },

  // Optional refresh token used to generate new access tokens later.
  refreshToken: {
    type: String,
  },
});

// Pre-save middleware: hash the password before storing it in the database.
userSchema.pre("save", async function () {
  // Only hash the password if it is new or changed.
  if (!this.isModified("password")) return;

  // Hash password with bcrypt using 10 salt rounds.
  this.password = await bcrypt.hash(this.password, 10);
});

// Instance method to check whether the provided password matches the hashed password.
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate a short-lived access token containing user id and email.
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

// Generate a long-lived refresh token containing only the user id.
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

// Create and export the User model from the schema.
export const User = mongoose.model("User", userSchema);
