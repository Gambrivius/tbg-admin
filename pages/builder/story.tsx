// react/next imports
import { useRouter } from "next/router";
import { useState } from "react";
import { useEffect } from "react";
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
  updateStory,
  deleteStory,
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
// maintain story object on the editor, not the parent class
// editor has methods to save and delete story object as well as
// modify
// useSWR to get the object originally
// get ID from props
type StoryEditorProps = {
  storyId: string | undefined;
  onDelete: () => void;
};
function StoryEditor(props: StoryEditorProps) {
  const storySwr = useSWR<IStoryTextObject | undefined>(
    props.storyId,
    getStory
  );
  const [storyData, setStoryData] = useState<IStoryTextObject | undefined>();
  useEffect(() => {
    setStoryData(storySwr.data);
  }, [storySwr.data]);

  async function onSaveStory() {
    if (!props.storyId || !storyData) return;
    updateStory(props.storyId, storyData);
  }
  async function onDeleteStory() {
    if (!props.storyId) return;
    deleteStory(props.storyId);
    props.onDelete();
  }

  if (!props.storyId) return <>Select something</>;
  if (!storySwr.data || !storyData) return <>Loading..</>;
  return (
    <>
      <Form>
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1" style={{ width: 120 }}>
            Room Name
          </InputGroup.Text>
          <Form.Control
            type="text"
            value={storyData.name}
            onChange={(e) => {
              setStoryData({
                ...storyData,
                name: e.target.value,
              });
            }}
          />
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text style={{ width: 120 }}>Description</InputGroup.Text>
          <Form.Control
            as="textarea"
            rows={5}
            value={storyData.description}
            onChange={(e) => {
              setStoryData({
                ...storyData,
                description: e.target.value,
              });
            }}
          />
        </InputGroup>
      </Form>
      <div className={styles.ButtonGroup}>
        <Button variant="primary" type="button" onClick={onSaveStory}>
          Save
        </Button>
        <Button variant="danger" type="button" onClick={onDeleteStory}>
          Delete
        </Button>
      </div>
    </>
  );
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
    } else {
      setSelectedStory(undefined);
    }
  }
  async function updateStories() {
    storiesSwr.mutate(getStoriesInZone(zoneId));
  }
  async function createStory(name: string) {
    const blankStory: IStoryTextObject = {
      name: name,
      zone: zoneId,
      description: "",
      outcomes: [],
    };
    addStory(blankStory);
    updateStories();
  }
  return (
    <>
      {!query.zone ? (
        ZoneSelector(zones)
      ) : (
        <>
          <div className={styles.panels}>
            <div className={styles.leftPanel}>
              <StoryManager
                stories={stories}
                selected={selectedStory?._id}
                onSelect={selectStoryId}
                onCreate={createStory}
              />
            </div>
            <div className={styles.rightPanel}>
              <div className={styles.rightPanelContent}>
                <StoryEditor
                  storyId={selectedStory?._id}
                  onDelete={() => {
                    selectStoryId();
                    updateStories();
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
