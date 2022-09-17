import axios, { AxiosError } from "axios";
import { APIStoryResponse, IStoryTextObject } from "../models/story";

export async function getAllStories(): Promise<APIStoryResponse> {
  return await axios.get("/api/story");
}

// TODO: catch errors andr eturn bad requests
export async function getStoriesInZone(id: string): Promise<APIStoryResponse> {
  const response = await axios.get(`/api/story?zone=${id}`);

  return response.data;
}

// not sure if I like returning IStoryTextObject or APIStoryReponse...
// also we could validate IDs with zod
export async function getStory(
  id: string
): Promise<IStoryTextObject | undefined> {
  if (!id) return undefined;
  try {
    const response = await axios.get("/api/story?id=" + id);
    const apiReponse: APIStoryResponse = response.data;
    if (apiReponse && apiReponse.data && apiReponse.data.length > 0) {
      return apiReponse.data[0];
    }
  } catch (error: any) {
    console.log(error);
  }
  return undefined;
}

export async function addStory(story: IStoryTextObject): Promise<boolean> {
  try {
    await axios.post("/api/story", story);
    return true;
  } catch (e) {
    return false;
  }
}
