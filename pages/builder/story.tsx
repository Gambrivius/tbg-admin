// react/next imports
import { useRouter } from "next/router";
import { useState } from "react";
import { useEffect } from "react";
import useSWR from "swr";
import { ObjectID } from "bson";
// model imports
import { APIZoneResponse, IZone } from "../../models/zone";
import {
  APIStoryResponse,
  IStoryTextObject,
  IStoryOutcome,
  IStoryText,
} from "../../models/story";
import { storyCategory, storyCategories } from "../../models/enum";
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
import MsgEditor from "../../components/msgEditor";
// bootstrap imports
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown";
// style imports
import styles from "../../styles/builder.module.css";

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
  const [selectedOutcome, setSelectedOutcome] = useState<string>("");
  useEffect(() => {
    setStoryData(storySwr.data);
    setSelectedOutcome("");
  }, [storySwr.data]);
  async function onNewOutcome() {
    if (!props.storyId || !storyData) return;
    const oid: string = new ObjectID().toString();
    let outcome: IStoryOutcome = {
      name: "New Outcome",
      _id: oid,
      weight: 1,
      category: "None",
      story_text: {
        actor_message: "",
        subject_message: "",
        room_message: "",
      },
    };
    storyData.outcomes.push(outcome);
    console.log(storyData);
    setStoryData({ ...storyData });
  }
  async function onSaveStory() {
    if (!props.storyId || !storyData) return;
    updateStory(props.storyId, storyData);
    // this needs a callback for the story objects list to update if name changed
  }
  async function onDeleteStory() {
    if (!props.storyId) return;
    deleteStory(props.storyId);
    props.onDelete();
  }
  async function selectOutcome(
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    id: string | undefined
  ) {
    if (id) setSelectedOutcome(id);
  }
  function getOutcome(id: string): IStoryOutcome | undefined {
    if (!storyData) return;
    let found: IStoryOutcome | undefined = undefined;
    storyData.outcomes.forEach((outcome: IStoryOutcome) => {
      if (outcome._id == id) {
        found = outcome;
        return;
      }
    });
    return found;
  }
  function updateOutcome(new_outcome: IStoryOutcome) {
    if (!storyData) return;
    let found: number = 0;
    storyData.outcomes.forEach((outcome: IStoryOutcome, index: number) => {
      if (outcome._id == outcome._id) {
        found = index;
        return;
      }
    });
    if (found) {
      storyData.outcomes.splice(found, 1, new_outcome);
      setStoryData(storyData);
    }
  }
  function updateStoryText(new_story_text: IStoryText) {
    if (!storyData) return;
    let found: number = 0;
    storyData.outcomes.forEach((outcome: IStoryOutcome, index: number) => {
      if (outcome._id == selectedOutcome) {
        found = index;
        return;
      }
    });
    if (found > -1) {
      // for this to work, we have to clone the previous storyData object
      // otherwise dom will not update because the object has the same object reference...
      let newStoryData: IStoryTextObject = Object.assign({}, storyData);
      let o: IStoryOutcome = storyData.outcomes[found];
      o.story_text = new_story_text;
      newStoryData.outcomes.splice(found, 1, o);
      setStoryData(newStoryData);
    }
  }
  function setOutcomeCategory(cat: string) {
    if (!storyData) return;
    let found: number = 0;
    storyData.outcomes.forEach((outcome: IStoryOutcome, index: number) => {
      if (outcome._id == selectedOutcome) {
        found = index;
        return;
      }
    });
    if (found > -1) {
      // for this to work, we have to clone the previous storyData object
      // otherwise dom will not update because the object has the same object reference...
      let newStoryData: IStoryTextObject = Object.assign({}, storyData);
      let o: IStoryOutcome = storyData.outcomes[found];
      o.category = cat;
      newStoryData.outcomes.splice(found, 1, o);
      setStoryData(newStoryData);
    }
  }
  function setOutcomeName(name: string) {
    if (!storyData) return;
    let found: number = 0;
    storyData.outcomes.forEach((outcome: IStoryOutcome, index: number) => {
      if (outcome._id == selectedOutcome) {
        found = index;
        return;
      }
    });
    if (found > -1) {
      // for this to work, we have to clone the previous storyData object
      // otherwise dom will not update because the object has the same object reference...
      let newStoryData: IStoryTextObject = Object.assign({}, storyData);
      let o: IStoryOutcome = storyData.outcomes[found];
      o.name = name;
      newStoryData.outcomes.splice(found, 1, o);
      setStoryData(newStoryData);
    }
  }
  console.log("Rerender");
  function setOutcomeWeight(w: string) {
    if (!storyData) return;

    let found: number = 0;
    storyData.outcomes.forEach((outcome: IStoryOutcome, index: number) => {
      if (outcome._id == selectedOutcome) {
        found = index;
        return;
      }
    });
    if (found > -1) {
      // for this to work, we have to clone the previous storyData object
      // otherwise dom will not update because the object has the same object reference...

      let newStoryData: IStoryTextObject = Object.assign({}, storyData);
      let o: IStoryOutcome = storyData.outcomes[found];
      let weight: string = o.weight.toString();
      if (/^(\d+)?\.?(\d+)?$/.test(w)) {
        weight = w;
        console.log(weight);
      }
      o.weight = weight; //parseFloat(weight);
      newStoryData.outcomes.splice(found, 1, o);
      setStoryData(newStoryData);
    }
  }
  let showOutcomeEditor = false;
  let thisOutcome: IStoryOutcome | undefined = undefined;
  if (selectedOutcome != "") {
    showOutcomeEditor = true;
    thisOutcome = getOutcome(selectedOutcome);
  }

  if (!props.storyId) return <>Select something</>;
  if (!storySwr.data || !storyData) return <>Loading..</>;
  // why does this crash?
  //const test = storyCategory.Hit;

  console.log(storyCategory);

  return (
    <>
      <div className={styles.splitPanel}>
        <div className={styles.splitPanelColumn}>
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
              <InputGroup.Text style={{ width: 120 }}>
                Description
              </InputGroup.Text>
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

          <div className={styles.objectListMini}>
            <ObjectList
              header="Story Outcomes"
              objects={storyData.outcomes}
              onSelect={selectOutcome}
              selected={selectedOutcome}
            />
          </div>
          <Button variant="primary" type="button" onClick={onNewOutcome}>
            New Outcome
          </Button>
          <hr />
          <div className={styles.ButtonGroup}>
            <Button variant="primary" type="button" onClick={onSaveStory}>
              Save
            </Button>
            <Button variant="danger" type="button" onClick={onDeleteStory}>
              Delete
            </Button>
          </div>
        </div>

        {showOutcomeEditor && thisOutcome ? (
          <div className={styles.splitPanelColumn}>
            <Form>
              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1" style={{ width: 120 }}>
                  Name
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  value={thisOutcome.name}
                  onChange={(e) => {
                    setOutcomeName(e.target.value);
                  }}
                />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1" style={{ width: 120 }}>
                  Category
                </InputGroup.Text>
                <Dropdown>
                  <Dropdown.Toggle>
                    {thisOutcome.category || "Select Category"}
                    <Dropdown.Menu></Dropdown.Menu>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {storyCategories.map((category: storyCategory) => (
                      <Dropdown.Item
                        key={category}
                        onClick={() => {
                          setOutcomeCategory(category);
                        }}
                      >
                        {category}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1" style={{ width: 120 }}>
                  Weight
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  value={thisOutcome.weight || ""}
                  onChange={(e) => {
                    setOutcomeWeight(e.target.value);
                  }}
                />
              </InputGroup>
            </Form>
            <MsgEditor
              story_text={thisOutcome.story_text}
              handleUpdate={updateStoryText}
            />
          </div>
        ) : (
          ""
        )}
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
                    setSelectedStory(undefined);
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
