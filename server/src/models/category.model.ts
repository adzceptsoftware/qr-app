import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  position: number;
  imageUrl?: string;
  parentId?: Types.ObjectId;
  restaurantId: Types.ObjectId;
}

const schema = new Schema<ICategory>(
  {
    name:         { type: String, required: true },
    position:     { type: Number, default: 0 },
    imageUrl:     String,
    parentId:     { type: Schema.Types.ObjectId, ref: "Category", index: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model<ICategory>("Category", schema);
