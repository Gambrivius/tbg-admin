import { Schema, model, models } from "mongoose";
import { string, z } from "zod";
import { IObject } from "./object";
import { storyCategory } from "./enum";

export interface IStoryContect {
  actor: IActorDetails;
  subject: IActorDetails;
}
export interface IActorDetails {
  name: string;
  gender: string; // make this an enum later/ add validation and model for mobs... mono repo
  object: string;
}

export interface IStoryText {
  actor_message: string;
  subject_message: string;
  room_message: string;
}

export interface IStoryOutcome extends IObject {
  weight: number;
  story_text: IStoryText;
  category: string;
  _id: string;
  name: string;
}

export interface IStoryTextObject extends IObject {
  name: string;
  description: string;
  zone: string;
  outcomes: IStoryOutcome[];
  _id?: string;
}

const storyTextSchema = new Schema<IStoryTextObject>({
  name: String,
  description: String,
  zone: Schema.Types.ObjectId,
  outcomes: [
    {
      name: String,
      _id: Schema.Types.ObjectId,
      weight: Number,
      category: String,
      story_text: {
        actor_message: String,
        subject_message: String,
        room_message: String,
      },
    },
  ],
});

export type APIStoryResponse = {
  message?: string;
  error?: any;
  data?: IStoryTextObject[];
};

export const zStoryTextSchema = z.object({
  name: z.string().min(1).max(40),
  description: z.string(),
  zone: z.string().length(24),
  outcomes: z.array(
    z.object({
      _id: z.string(),
      name: z.string(),
      weight: z.number().nonnegative(),
      category: z.enum([
        storyCategory.None,
        storyCategory.Crit,
        storyCategory.Hit,
        storyCategory.Miss,
        storyCategory.Dodge,
        storyCategory.Parry,
        storyCategory.Block,
        storyCategory.Armor,
        storyCategory.SpellBlock,
      ]),
      story_text: z.object({
        actor_message: z.string(),
        subject_message: z.string(),
        room_message: z.string(),
      }),
    })
  ),
});

const StoryText =
  models.StoryText || model<IStoryTextObject>("StoryText", storyTextSchema);
export default StoryText;
