import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["membership", "writer", "editor", "admin"],
      required: true,
    },
    membership: {
      expiryDate: { type: Date },
      categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    },
    writerPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    editorPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    resetToken: { type: String }, // For storing reset token
    resetTokenExpiry: { type: Date }, // Token expiry timestamp
  },
  {
    timestamps: true,
  }
);



const User = mongoose.model("User", userSchema);


export default User;
