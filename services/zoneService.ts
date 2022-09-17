import axios, { AxiosError } from "axios";
import { IZone, APIZoneResponse } from "../models/zone";

export async function getAllZones(): Promise<APIZoneResponse> {
  const response = await axios.get("/api/zone");
  return response.data;
}

export async function addZone(zone: IZone): Promise<boolean> {
  try {
    const response = await axios.post("/api/zone", zone);
    return true;
  } catch (e) {
    return false;
  }
}

export async function getZone(url: string, id: string): Promise<IZone | null> {
  if (!id) return null;
  try {
    const response = await axios.get(`${url}?id=${id}`);
    return response.data.data[0];
  } catch (error: any) {
    console.log(error);
  }
  return null;
}

// todo: this doesn't need to return anything.  raise an error if it fails
export async function deleteZone(
  id: string
): Promise<[ok: boolean, err: Error | null]> {
  try {
    const response = await axios.delete("/api/zone?id=" + id);
    return [true, null];
  } catch (error: any) {
    if (error.response) {
      return [false, Error(error.response.data.message)];
    }
  }
  return [false, Error("Unknown error")];
}
