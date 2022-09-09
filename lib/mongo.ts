import { Schema, model, connect } from "mongoose";

async function connectMongo() {
  if (!process.env.MONGO_CSTRING) return;
  await connect(process.env.MONGO_CSTRING);
}

export default connectMongo;
