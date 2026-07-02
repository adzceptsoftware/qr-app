import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { Role } from "../types";

export interface IStaff extends Document {
  name: string;
  email?: string;
  username?: string;
  passwordHash: string;
  role: Role;
  restaurantId?: Types.ObjectId;
}

const schema = new Schema<IStaff>(
  {
    name:         { type: String, required: true },
    // Email logs in SUPERADMIN/ADMIN accounts; username logs in ADMIN-created KITCHEN accounts.
    // Both are optional+sparse-unique so a doc can have either without colliding on the other's null value.
    email:        { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    username:     { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role:         { type: String, enum: ["SUPERADMIN", "ADMIN", "KITCHEN"], required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant" },
  },
  { timestamps: true }
);

export default mongoose.models.Staff || mongoose.model<IStaff>("Staff", schema);
