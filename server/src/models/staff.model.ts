import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { Role } from "../types";

export interface IStaff extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  restaurantId?: Types.ObjectId;
}

const schema = new Schema<IStaff>(
  {
    name:         { type: String, required: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role:         { type: String, enum: ["SUPERADMIN", "ADMIN", "KITCHEN"], required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant" },
  },
  { timestamps: true }
);

export default mongoose.models.Staff || mongoose.model<IStaff>("Staff", schema);
