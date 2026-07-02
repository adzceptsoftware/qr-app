import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IMenuItem extends Document {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  available: boolean;
  badge?: string;
  categoryId: Types.ObjectId;
}

const schema = new Schema<IMenuItem>(
  {
    name:        { type: String, required: true },
    description: String,
    price:       { type: Number, required: true },
    imageUrl:    String,
    available:   { type: Boolean, default: true },
    badge:       String,
    categoryId:  { type: Schema.Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", schema);
