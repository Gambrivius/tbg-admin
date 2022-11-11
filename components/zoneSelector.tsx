import Table from "react-bootstrap/Table";
import { IZone } from "../models/zone";

export default function ZoneSelector(zones: IZone[]) {
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
          {zones.map((zone: IZone) => (
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
