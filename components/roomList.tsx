import "bootstrap/dist/css/bootstrap.min.css";

import { IRoom } from "../models/room";

import Table from "react-bootstrap/Table";

type RoomListProps = {
  rooms: IRoom[];
  selectedRoom: string | undefined;
  onClickRoom: (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    id: string | undefined
  ) => void;
};

export function RoomList(props: RoomListProps) {
  if (!props.rooms) return <>Loading...</>;
  return (
    <Table className="table-hover">
      <thead>
        <tr>
          <th>Room Name</th>
        </tr>
      </thead>

      <tbody>
        {props.rooms.map((room: IRoom) => (
          <tr
            key={room._id}
            onClick={(event) => props.onClickRoom(event, room._id)}
            className={
              room._id == props.selectedRoom ? "table-primary" : "table-default"
            }
          >
            <td>{room.name}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
