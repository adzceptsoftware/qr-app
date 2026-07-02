import mongoose, { Schema, type Document, type Types } from "mongoose";
import { randomUUID } from "crypto";

export interface ITable extends Document {
  tableNumber: string;
  token: string;
  restaurantId: Types.ObjectId;
}

const schema = new Schema<ITable>(
  {
    tableNumber:  { type: String, required: true },
    token:        { type: String, required: true, unique: true, default: () => randomUUID() },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
  },
  { timestamps: true }
);

schema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

export default mongoose.models.Table || mongoose.model<ITable>("Table", schema);
