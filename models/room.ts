import { Schema, model, models } from "mongoose";
import { IObject } from "./object";

export enum Direction {
  Error = "Error",
  North = "North",
  South = "South",
  East = "East",
  West = "West",
}

// 1. Create an interface representing a document in MongoDB.
export interface IRoom extends IObject {
  name: string;
  description: string;
  zone: string;
  exits: { direction: string; destination: string }[];
  _id: string;
}

// 2. Create a Schema corresponding to the document interface.
const roomSchema = new Schema<IRoom>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  zone: Schema.Types.ObjectId,
  exits: [{ direction: String, destination: Schema.Types.ObjectId }],
});

export interface IRoomResponse {
  message?: String;
  error?: any;
  rooms?: IRoom[];
}

const Room = models.Room || model<IRoom>("Room", roomSchema);
export default Room;
