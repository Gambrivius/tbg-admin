import axios, { AxiosError } from "axios";
import { IRoom } from "../models/room";

export function ReverseDir(direction: string) {
  switch (direction) {
    case "North":
      return "South";
    case "South":
      return "North";
    case "East":
      return "West";
    case "West":
      return "East";
    default:
      return "";
  }
  return "";
}

export async function getAllRooms(): Promise<any> {
  try {
    const response = await axios.get("/api/room");
    return { rooms: response.data.rooms, success: true };
  } catch (e) {
    return { rooms: [], success: false };
  }
}

export async function getRoomsInZone(key: string): Promise<any> {
  try {
    const api_string = `/api/room?zone=${key}`;
    const response = await axios.get(api_string);
    return { rooms: response.data.rooms, success: true };
  } catch (e) {
    return { rooms: [], success: false };
  }
}

export async function addRoom(room: IRoom): Promise<boolean> {
  try {
    const response = await axios.post("/api/room", room);
    return true;
  } catch (e) {
    return false;
  }
}

export async function getRoom(id: string): Promise<IRoom | null> {
  if (!id) return null;
  try {
    const response = await axios.get("/api/room?id=" + id);
    return response.data.rooms[0];
  } catch (error: any) {
    console.log(error);
  }
  return null;
}

export async function updateRoom(id: string, room: IRoom): Promise<boolean> {
  try {
    const response = await axios.put("/api/room?id=" + id, room);

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export async function deleteRoom(
  id: string
): Promise<[ok: boolean, err: Error | null]> {
  try {
    const response = await axios.delete("/api/room?id=" + id);
    return [true, null];
  } catch (error: any) {
    if (error.response) {
      return [false, Error(error.response.data.message)];
    }
  }
  return [false, Error("Unknown error")];
}
