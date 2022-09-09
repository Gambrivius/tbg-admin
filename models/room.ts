import { Schema, model, models } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
interface IRoom {
  name: string;
  description: string;
  zone: string;
  exits: { direction: string; destination: string };
}

// 2. Create a Schema corresponding to the document interface.
const roomSchema = new Schema<IRoom>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  zone: Schema.Types.ObjectId,
  exits: [{ direction: String, destination: Schema.Types.ObjectId }],
});

const Room = models.Room || model<IRoom>("Room", roomSchema);
export default Room;
