import Dropdown from "react-bootstrap/Dropdown";
import Container from "react-bootstrap/Container";
import InputGroup from "react-bootstrap/InputGroup";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { RoomSelector } from "./roomSelector";
import { IRoom } from "../models/room";
import { useState } from "react";
interface ExitBuildProps {
  room: IRoom;
  onSubmit: (name: string, destinationId: string, symmetrical: boolean) => void;
}

export function ExitBuilder(props: ExitBuildProps) {
  const [alertState, setAlertState] = useState({
    show: false,
    title: "Undefined",
    message: "Undefined",
  });
  const [exitState, setExitState] = useState({
    active: false,

    exitDestination: "",
  });
  const [symmetricalChecked, setSymmetricalChecked] = useState(true);
  const [exitName, setExitName] = useState("");
  const [selectedRoom, setSelectedRoom] = useState({
    valid: false,
    roomId: "",
  });
  function cancel() {
    setExitName("");
    setExitState({
      active: false,
      exitDestination: "",
    });
  }
  function addExit() {
    if (!selectedRoom.valid) {
      setAlertState({
        show: true,
        title: "Invalid Room ID",
        message: `'${selectedRoom.roomId}' is not a valid room id.`,
      });
      return;
    }
    let duplicate = false;
    props.room?.exits?.forEach(({ direction, destination }) => {
      console.log(direction);
      console.log(exitName);
      if (exitName == direction) {
        console.log("SAME");
        duplicate = true;
        return;
      }
    });
    if (duplicate) {
      setAlertState({
        show: true,
        title: "Invalid Exit Name",
        message: `Room already has an exit named '${exitName}'.`,
      });
      return;
    }
    props.onSubmit(exitName, selectedRoom.roomId, symmetricalChecked);
    setAlertState({
      show: false,
      title: "",
      message: "",
    });
    setExitName("");
    setExitState({
      active: false,
      exitDestination: "",
    });
  }
  function AvailableDirections(): string[] {
    let directions: string[] = ["North", "South", "East", "West", "Custom"];
    props.room?.exits?.forEach(({ direction, destination }) => {
      const index = directions.indexOf(direction);
      if (index >= 0) {
        directions.splice(index, 1);
      }
    });
    return directions;
  }
  return (
    <>
      <Dropdown className="mb-3">
        <Dropdown.Toggle variant="success">New Exit</Dropdown.Toggle>
        <Dropdown.Menu>
          {AvailableDirections()?.map((dir: String) => (
            <Dropdown.Item
              key={dir}
              onClick={() => {
                setExitName(dir);
              }}
            >
              {dir}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      {exitName != "" ? (
        <Card>
          <Card.Header>New Exit</Card.Header>
          <Card.Body>
            <Form>
              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1" style={{ width: 120 }}>
                  Exit Name
                </InputGroup.Text>
                <Form.Control type="text" value={exitName} />
              </InputGroup>
            </Form>
            <RoomSelector
              onSelect={(valid, roomId) => {
                setSelectedRoom({ valid, roomId });
              }}
            />
            <input
              type="checkbox"
              id="topping"
              name="topping"
              value="Symmetrical"
              checked={symmetricalChecked}
              onChange={() => {
                setSymmetricalChecked(!symmetricalChecked);
              }}
            />
            <OverlayTrigger
              overlay={
                <Tooltip id="tooltip">
                  Attempt to create an exit in the destination room in the
                  reverse direction back to the source room. Requires standard
                  exits.
                </Tooltip>
              }
            >
              <span className="d-inline-block">Symmetrical</span>
            </OverlayTrigger>
            <br />
            <ButtonGroup className="mb-3">
              <Button variant="primary" type="button" onClick={addExit}>
                Add
              </Button>
              <Button variant="secondary" type="button" onClick={cancel}>
                Cancel
              </Button>
            </ButtonGroup>
            {alertState.show ? (
              <Alert
                variant="danger"
                onClose={() => setAlertState({ ...alertState, show: false })}
                dismissible
              >
                <Alert.Heading>{alertState.title}</Alert.Heading>
                <p>{alertState.message}</p>
              </Alert>
            ) : (
              " "
            )}
          </Card.Body>
        </Card>
      ) : (
        <></>
      )}
    </>
  );
}
