import "bootstrap/dist/css/bootstrap.min.css";

import { IStoryTextObject } from "../models/story";

import Table from "react-bootstrap/Table";

type StoryListProps = {
  stories: IStoryTextObject[];
  selected: string | undefined;
  onSelect: (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    id: string | undefined
  ) => void;
};

export function RoomList(props: StoryListProps) {
  if (!props.stories) return <>Loading...</>;
  return (
    <Table className="table-hover">
      <thead>
        <tr>
          <th>Story Name</th>
        </tr>
      </thead>

      <tbody>
        {props.stories.map((story: IStoryTextObject) => (
          <tr
            key={story._id}
            onClick={(event) => props.onSelect(event, story._id)}
            className={
              story._id == props.selected ? "table-primary" : "table-default"
            }
          >
            <td>{story.name}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
