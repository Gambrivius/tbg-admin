import Dropdown from "react-bootstrap/Dropdown";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ButtonDropdown from "react-bootstrap/ButtonDropdown";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { IRoom, IRoomResponse } from "../models/room";
import { IZone, APIZoneResponse } from "../models/zone";
import { getAllZones, getZone } from "../services/zoneService";
import { getRoomsInZone, getRoom } from "../services/roomService";
import { useState } from "react";
import useSWR from "swr";

interface RoomSelectorProps {
  onSelect: (valid: boolean, roomId: string) => void;
}
export function RoomSelector(props: RoomSelectorProps) {
  const [selectedZone, setSelectedZone] = useState({});
  const [selectedRoom, setSelectedRoom] = useState({});

  const [roomId, setRoomId] = useState("");
  const [valid, setValid] = useState(false);
  const [message, setMessage] = useState("");

  const rooms = useSWR<IRoomResponse, Error>(selectedZone._id, getRoomsInZone);
  const zones = useSWR<APIZoneResponse, Error>("/api/zone", getAllZones);

  async function selectRoom(room: IRoom) {
    if (room) {
      setRoomId(room._id);
      setSelectedRoom(room);
      setValid(true);
      props.onSelect(true, room._id);
    }
  }

  async function updateRoomId(id: string) {
    setRoomId(id);
    if (id.length != 24) {
      setValid(false);
      setMessage("Room ID must be 24 characters long");
      props.onSelect(false, id);
      return;
    }
    const roomData = await getRoom(id);
    if (!roomData) {
      setValid(false);
      setMessage("Could not find room");
      props.onSelect(false, id);
      return;
    }
    setSelectedRoom(roomData);
    const zoneData = await getZone("/api/zone", roomData.zone);
    if (!zoneData) {
      setValid(false);
      setMessage("Could not find zone for room");
      props.onSelect(false, id);
      return;
    }
    setSelectedZone(zoneData);
    setValid(true);
    props.onSelect(true, id);
  }

  return (
    <>
      <Form>
        <InputGroup className="mb-3" hasValidation>
          <Dropdown>
            <Dropdown.Toggle>
              {selectedZone.name || "Select Zone"}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {zones.data?.data?.map((zone: IZone) => (
                <Dropdown.Item
                  key={zone._id}
                  onClick={() => {
                    setSelectedZone(zone);
                  }}
                >
                  {zone.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown>
            <Dropdown.Toggle>
              {selectedRoom.name || "Select Room"}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {rooms?.data?.rooms.map((room: IRoom) => (
                <Dropdown.Item
                  key={room._id}
                  onClick={() => {
                    selectRoom(room);
                  }}
                >
                  {room.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <InputGroup.Text id="basic-addon1">Room ID</InputGroup.Text>
          <Form.Control
            type="text"
            value={roomId}
            isValid={valid}
            isInvalid={!valid}
            onChange={(e) => {
              updateRoomId(e.target.value);
            }}
          />
          <Form.Control.Feedback type="invalid">
            {message}
          </Form.Control.Feedback>
        </InputGroup>
      </Form>
    </>
  );
}
