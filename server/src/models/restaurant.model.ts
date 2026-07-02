import mongoose, { Schema, type Document } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  address?: string;
  phone?: string;
  active: boolean;
}

const schema = new Schema<IRestaurant>(
  {
    name:    { type: String, required: true },
    address: String,
    phone:   String,
    active:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Restaurant ||
  mongoose.model<IRestaurant>("Restaurant", schema);
