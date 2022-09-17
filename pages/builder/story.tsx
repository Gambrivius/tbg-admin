// react/next imports
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
// model imports
import { APIZoneResponse, IZone, IZoneResponse } from "../../models/zone";
import { APIStoryResponse, IStoryTextObject } from "../../models/story";
// service imports
import { getAllZones, getZone } from "../../services/zoneService";
import {
  getStoriesInZone,
  getStory,
  addStory,
} from "../../services/storyService";
// component imports
import ZoneSelector from "../../components/zoneSelector";
import { ObjectList } from "../../components/objectList";
// bootstrap imports
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
// stype imports
import styles from "../../styles/builder.module.css";

// TODO: Build Story Editor
type StoryEditorProps = {
  story: IStoryTextObject;
};
function StoryEditor(props: StoryEditorProps) {
  return <></>;
}

type StoryManagerProps = {
  stories: IStoryTextObject[];
  selected: string | undefined;
  onCreate: (name: string) => void;
  onSelect: (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    id: string | undefined
  ) => void;
};

function StoryManager(props: StoryManagerProps) {
  const [newStoryName, setNewStoryName] = useState("");

  return (
    <>
      <div style={{ display: "block", width: 380, padding: 5 }}>
        <Form>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">Story Name</InputGroup.Text>
            <Form.Control
              type="text"
              defaultValue={newStoryName}
              onChange={(e) => {
                setNewStoryName(e.target.value);
              }}
            />
            <Button
              variant="primary"
              type="button"
              onClick={() => {
                props.onCreate(newStoryName);
                setNewStoryName("");
              }}
            >
              Create
            </Button>
          </InputGroup>
        </Form>
      </div>
      <div className={styles.objectList}>
        <ObjectList
          header="Story Objects"
          objects={props.stories}
          onSelect={props.onSelect}
          selected={props.selected}
        />
      </div>
    </>
  );
}

export default function Story() {
  const { query } = useRouter();
  const zoneId: string = query.zone as string;
  const zonesSwr = useSWR<APIZoneResponse>("/api/zone", getAllZones);
  const storiesSwr = useSWR<APIStoryResponse>(zoneId, getStoriesInZone);
  const zones: IZone[] = zonesSwr.data?.data || [];
  const stories: IStoryTextObject[] = storiesSwr.data?.data || [];

  const [selectedStory, setSelectedStory] = useState<IStoryTextObject | null>();
  async function selectStoryId(
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    id: string | undefined
  ) {
    if (id) {
      setSelectedStory(await getStory(id));
    }
  }
  async function createStory(name: string) {
    const blankStory: IStoryTextObject = {
      name: name,
      zone: zoneId,
      description: "",
      outcomes: [],
    };
    addStory(blankStory);
    storiesSwr.mutate(getStoriesInZone(zoneId));
  }
  return (
    <>
      {!query.zone ? (
        ZoneSelector(zones)
      ) : (
        <div className={styles.leftPanel}>
          <StoryManager
            stories={stories}
            selected={selectedStory?._id}
            onSelect={selectStoryId}
            onCreate={createStory}
          />
        </div>
      )}
    </>
  );
}
