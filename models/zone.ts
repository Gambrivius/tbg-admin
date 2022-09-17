import { Schema, model, models } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IZone {
  name: string;
  _id?: string;
}

export interface IZoneResponse {
  success: boolean;
  message: string;
  zones: IZone[] | null;
  error: any | null;
}

export type APIZoneResponse = {
  message?: string;
  error?: any;
  data?: IZone[];
};

// 2. Create a Schema corresponding to the document interface.
export const zoneSchema = new Schema<IZone>({
  name: { type: String, required: true },
});

const Zone = models.Zone || model<IZone>("Zone", zoneSchema);
export default Zone;
