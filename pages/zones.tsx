import type { NextPage } from "next";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import { IZone, APIZoneResponse } from "../models/zone";
import { getAllZones, addZone, deleteZone } from "../services/zoneService";
import useSWR from "swr";

interface IAlertData {
  visible: boolean;
  message: string;
  color: string;
}
const Zones: NextPage = () => {
  const { isValidating, data, error, mutate } = useSWR<APIZoneResponse, Error>(
    "/api/zone",
    getAllZones
  );
  const [zoneData, setZoneData] = useState({ name: "" });
  const [alertData, setAlertData] = useState<IAlertData>({
    visible: false,
    message: "",
    color: "primary",
  });

  const onDismissAlert = () => {
    setAlertData({ ...alertData, visible: false });
  };
  async function onClickCreateZone() {
    const e = await addZone(zoneData);
    if (e) {
      setAlertData({
        visible: true,
        color: "success",
        message: "Successfully created zone",
      });
      mutate(getAllZones);
    } else {
      setAlertData({
        visible: true,
        color: "danger",
        message: "Failed to create zone",
      });
    }
  }
  async function onClickDeleteZone(id: string) {
    const [ok, err] = await deleteZone(id);
    if (!ok) {
      setAlertData({
        visible: true,
        color: "danger",
        message: err?.message || "",
      });
    } else {
      mutate(getAllZones);
      setAlertData({
        visible: true,
        color: "success",
        message: "Successfully deleted zone",
      });
    }
  }
  return (
    <>
      <Container>
        <Table className="table-striped overflow-scroll">
          <thead>
            <tr>
              <th>Zone ID</th>
              <th>Zone Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((zone: IZone) => (
              <tr key={zone._id}>
                <td>{zone._id}</td>
                <td>{zone.name}</td>
                <td>
                  <Button variant="outline-primary">Edit</Button>{" "}
                  <Button
                    variant="outline-danger"
                    onClick={() => {
                      if (zone._id) {
                        onClickDeleteZone(zone._id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div style={{ display: "block", width: 700, padding: 30 }}>
          <Form>
            <Form.Label>Zone Name :</Form.Label>
            <Form.Control
              type="text"
              defaultValue={zoneData.name}
              onChange={(e) => {
                setZoneData({ ...zoneData, name: e.target.value });
              }}
            />

            <Button variant="primary" type="button" onClick={onClickCreateZone}>
              Create Zone
            </Button>
          </Form>
        </div>
        <Alert
          variant={alertData.color}
          show={alertData.visible}
          onClose={onDismissAlert}
          dismissible={true}
        >
          {alertData.message}
        </Alert>
      </Container>
    </>
  );
};

export default Zones;
