import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  position: number;
  icon?: string;
  restaurantId: Types.ObjectId;
}

const schema = new Schema<ICategory>(
  {
    name:         { type: String, required: true },
    position:     { type: Number, default: 0 },
    icon:         String,
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model<ICategory>("Category", schema);
