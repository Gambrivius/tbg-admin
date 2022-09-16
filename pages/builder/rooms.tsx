import type { NextPage } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/router";
import { useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";

import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { IRoom, IRoomResponse } from "../../models/room";
import ReverseTestlol from "../../models/room";
import useSWR from "swr";
import { IZone, IZoneResponse } from "../../models/zone";
import { getAllZones, getZone } from "../../services/zoneService";
import {
  getAllRooms,
  getRoomsInZone,
  addRoom,
  getRoom,
  updateRoom,
  deleteRoom,
  ReverseDir,
} from "../../services/roomService";
import { RoomList } from "../../components/roomList";
import { ExitBuilder } from "../../components/exitBuilder";
import styles from "../../styles/rooms.module.css";
import room from "../api/room";

function SelectZoneView(props) {
  return (
    <>
      <h4>Please select a zone to build:</h4>
      <Table className="table-hover">
        <thead>
          <tr>
            <th>Zone ID</th>
            <th>Zone Name</th>
          </tr>
        </thead>
        <tbody>
          {props?.zones?.map((zone: IZone) => (
            <tr key={zone._id}>
              <td>{zone._id}</td>
              <td>
                <a href={"?zone=" + zone._id}>{zone.name}</a>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

function Rooms() {
  const { query } = useRouter();
  const zoneId: string = query.zone as string;

  const allRooms = useSWR<IRoomResponse, Error>("/api/room", getAllRooms);
  const rooms = useSWR<IRoomResponse, Error>(zoneId, getRoomsInZone);
  const zones = useSWR<IZoneResponse, Error>("/api/zone", getAllZones);

  const zoneData = useSWR<IZone | null, Error>(["/api/zone", zoneId], getZone);
  const [roomId, setRoomId] = useState("");
  //const roomData = useSWR<IRoom | null, Error>(roomId, getRoom(roomId));
  const [newRoomName, setNewRoomName] = useState("");
  const [roomEditData, setRoomEditData] = useState<IRoom | null>();
  let nameMap = {};
  if (allRooms && allRooms.data) {
    allRooms?.data?.rooms?.forEach((room: IRoom) => {
      nameMap[room._id] = room.name;
    });
  }
  async function deleteExit(name: string) {
    if (!roomEditData || !roomEditData.exits) return;
    let e = roomEditData?.exits || [];
    e.forEach((exit, index) => {
      if (exit.direction == name) {
        e.splice(index, 1);
      }
    });
    setRoomEditData({ ...roomEditData, exits: e });
    updateRoom(roomEditData._id, roomEditData);
  }
  async function addExit(
    name: string,
    destinationId: string,
    symmetrical: boolean
  ) {
    console.log("CALLED");

    if (symmetrical == true) {
      // update immediately if symmetrical
      let rdir = ReverseDir(name);
      let dest_room: IRoom | null = await getRoom(destinationId);
      if (dest_room) {
        let e = dest_room.exits || [];
        e.push({ direction: rdir, destination: roomEditData?._id || "" });
        dest_room.exits = e;

        let src_room: IRoom | null = await getRoom(roomEditData._id);
        if (src_room) {
          let e2 = src_room?.exits || [];
          e2.push({ direction: name, destination: destinationId });
          setRoomEditData({ ...roomEditData, exits: e2 });
          updateRoom(dest_room._id, dest_room);
          updateRoom(src_room._id, src_room);
        }
      }
    } else {
      // todo: don't allow duplicate exit directions
      let e = roomEditData?.exits || [];
      e.push({ direction: name, destination: destinationId });
      setRoomEditData({ ...roomEditData, exits: e });
      updateRoom(roomEditData._id, roomEditData);
    }
  }
  async function setRoom(id: string | undefined) {
    if (id) setRoomId(id);
    const roomData = await getRoom(id);
    setRoomEditData(roomData);
  }
  async function selectRoom(
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    id: string | undefined
  ) {
    setRoom(id);
  }

  async function saveRoom() {
    if (roomId && roomEditData) {
      updateRoom(roomId, roomEditData);
      rooms.mutate(getRoomsInZone(zoneId));
    }
  }
  async function deleteRoomClick() {
    if (roomId) {
      deleteRoom(roomId);
      setRoomId("");
      rooms.mutate(getRoomsInZone(zoneId));
    }
  }

  const createRoom = () => {
    if (!zoneId) return;
    addRoom({
      zone: zoneId,
      name: newRoomName,
      description: "New room",
      exits: [],
    });
    rooms.mutate(getRoomsInZone(zoneId));
  };
  return (
    <div>
      {!query.zone ? (
        SelectZoneView(zones.data)
      ) : (
        <div className={styles.panels}>
          <div className={styles.leftPanel}>
            <div style={{ display: "block", width: 380, padding: 5 }}>
              <h6>
                Editing Zone: {zoneData.data?.name}{" "}
                <a href="/builder/rooms">(change)</a>
              </h6>
              <Form>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon1">Room Name</InputGroup.Text>
                  <Form.Control
                    type="text"
                    defaultValue={newRoomName}
                    onChange={(e) => {
                      setNewRoomName(e.target.value);
                    }}
                  />
                  <Button variant="primary" type="button" onClick={createRoom}>
                    Create Room
                  </Button>
                </InputGroup>
              </Form>
            </div>
            <div className={styles.roomsList}>
              <RoomList
                rooms={rooms.data?.rooms || []}
                onClickRoom={selectRoom}
                selectedRoom={roomId}
              />
            </div>
          </div>

          <div className={styles.rightPanel}>
            <div className={styles.rightPanelContent}>
              <h6>Room ID: {roomEditData?._id}</h6>
              <Form>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon1" style={{ width: 120 }}>
                    Room Name
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    value={roomEditData?.name}
                    onChange={(e) => {
                      setRoomEditData({
                        ...roomEditData,
                        name: e.target.value,
                      });
                    }}
                  />
                </InputGroup>

                <InputGroup className="mb-3">
                  <InputGroup.Text style={{ width: 120 }}>
                    Description
                  </InputGroup.Text>
                  <Form.Control
                    as="textarea"
                    rows="10"
                    value={roomEditData?.description}
                    onChange={(e) => {
                      setRoomEditData({
                        ...roomEditData,
                        description: e.target.value,
                      });
                    }}
                  />
                </InputGroup>
              </Form>
              <div className={styles.ButtonGroup}>
                <Button variant="primary" type="button" onClick={saveRoom}>
                  Save
                </Button>
                <Button
                  variant="danger"
                  type="button"
                  onClick={deleteRoomClick}
                >
                  Delete
                </Button>
              </div>
              <h5>Exits</h5>
              <Table className="table-hover">
                <thead>
                  <tr>
                    <th>Exit Direction</th>
                    <th>Room Name</th>
                    <th>Room ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roomEditData?.exits?.map(
                    (exit: { direction: string; destination: string }) => (
                      <tr key={exit.direction}>
                        <td>{exit.direction}</td>
                        <td>
                          <a
                            href="#"
                            onClick={() => {
                              setRoom(exit.destination);
                            }}
                          >
                            {nameMap[exit.destination]}
                          </a>
                        </td>
                        <td>{exit.destination}</td>
                        <td>
                          <Button
                            variant="danger"
                            type="button"
                            onClick={() => {
                              deleteExit(exit.direction);
                            }}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </Table>
              <ExitBuilder
                room={roomEditData}
                onSubmit={(name, destinationId, symmetrical) => {
                  addExit(name, destinationId, symmetrical);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Rooms;
