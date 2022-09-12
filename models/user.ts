import { Schema, model, models } from "mongoose";

interface IUser {
  username: String;
  hash: String;
  roles: String[];
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  hash: { type: String, required: true },
  roles: [{ type: String, required: false }],
});

const User = models.User || model<IUser>("User", userSchema);
export default User;
