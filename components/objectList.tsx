import Table from "react-bootstrap/Table";
import { IObject } from "../models/object";

type ObjectListProps = {
  header: string;
  objects: IObject[];
  selected: string | undefined;
  onSelect: (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    id: string | undefined
  ) => void;
};

export function ObjectList(props: ObjectListProps) {
  if (!props.objects) return <>Loading...</>;
  return (
    <Table className="table-hover">
      <thead>
        <tr>
          <th>{props.header}</th>
        </tr>
      </thead>

      <tbody>
        {props.objects.map((obj: IObject) => (
          <tr
            key={obj._id}
            onClick={(event) => props.onSelect(event, obj._id)}
            className={
              obj._id == props.selected ? "table-primary" : "table-default"
            }
          >
            <td>{obj.name}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
