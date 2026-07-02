import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { OrderStatus } from "../types";

export interface IOrderItem {
  _id: Types.ObjectId;
  menuItemId: Types.ObjectId;
  name: string;
  qty: number;
  price: number;
}

export interface IOrder extends Document {
  status: OrderStatus;
  total: number;
  tableId: Types.ObjectId;
  tableNumber: string;
  restaurantId: Types.ObjectId;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  menuItemId: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
  name:       { type: String, required: true },
  qty:        { type: Number, required: true, min: 1 },
  price:      { type: Number, required: true },
});

const orderSchema = new Schema<IOrder>(
  {
    status: {
      type: String,
      enum: ["RECEIVED", "PREPARING", "READY", "SERVED", "CANCELLED"],
      default: "RECEIVED",
    },
    total:        { type: Number, required: true },
    tableId:      { type: Schema.Types.ObjectId, ref: "Table", required: true },
    tableNumber:  { type: String, required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
    items:        [orderItemSchema],
  },
  { timestamps: true }
);

orderSchema.index({ restaurantId: 1, status: 1, createdAt: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
