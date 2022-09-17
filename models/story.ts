import { Schema, model, models } from "mongoose";
import { z } from "zod";
import { IObject } from "./object";

export interface IStoryText {
  actor_message: string;
  subject_message: string;
  room_message: string;
}

export interface IStoryOutcome {
  weight: number;
  story_text: IStoryText;
  category: string;
}

export interface IStoryTextObject extends IObject {
  name: string;
  description: string;
  zone: string;
  outcomes: IStoryOutcome[];
}

const storyTextSchema = new Schema<IStoryTextObject>({
  name: String,
  description: String,
  zone: Schema.Types.ObjectId,
  outcomes: [
    {
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
      weight: z.number().nonnegative(),
      category: z.enum([
        "Crit",
        "Hit",
        "Miss",
        "Dodge",
        "Parry",
        "Block",
        "Armor",
        "SpellBlock",
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
