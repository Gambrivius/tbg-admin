import React, { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { parseText } from "../lib/parse-text";
import { IStoryText, IActorDetails } from "../models/story";
import Table from "react-bootstrap/Table";
import {
  genderObject,
  genderPossessivePronoun,
  genderReflexive,
  genderSubject,
  possessiveName,
} from "../lib/parse-text";
// style imports
import styles from "../styles/msgeditor.module.css";

type TemplateToolProps = {
  actor: IActorDetails;
  subject: IActorDetails;
};
function TemplateTable(props: TemplateToolProps) {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Code</th>
          <th>Replacement</th>
          <th>Code</th>
          <th>Replacement</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>%a%</td>
          <td>{props.actor.name}</td>
          <td>%s%</td>
          <td>{props.subject.name}</td>
        </tr>
        <tr>
          <td>%as%</td>
          <td>{possessiveName(props.actor.name)}</td>
          <td>%ss%</td>
          <td>{possessiveName(props.subject.name)}</td>
        </tr>
        <tr>
          <td>%a-he%</td>
          <td>{genderSubject(props.actor.gender)}</td>
          <td>%s-he%</td>
          <td>{genderSubject(props.subject.gender)}</td>
        </tr>
        <tr>
          <td>%a-him%</td>
          <td>{genderObject(props.actor.gender)}</td>
          <td>%s-him%</td>
          <td>{genderObject(props.subject.gender)}</td>
        </tr>
        <tr>
          <td>%a-hers%</td>
          <td>{genderPossessivePronoun(props.actor.gender)}</td>
          <td>%s-hers%</td>
          <td>{genderPossessivePronoun(props.subject.gender)}</td>
        </tr>
        <tr>
          <td>%a-himself%</td>
          <td>{genderReflexive(props.actor.gender)}</td>
          <td>%s-himself%</td>
          <td>{genderReflexive(props.subject.gender)}</td>
        </tr>
        <tr>
          <td>%a-obj%</td>
          <td>{props.actor.object}</td>
          <td>%s-obj%</td>
          <td>{props.subject.object}</td>
        </tr>
      </tbody>
    </Table>
  );
}

type MobEditorProps = {
  title: string;
  state: IActorDetails;

  onChange: (data: IActorDetails) => void;
};

function MobEditor(props: MobEditorProps) {
  function handleName(event: React.ChangeEvent<HTMLInputElement>) {
    props.onChange({ ...props.state, name: event.target.value });
  }
  function handleGender(event: React.ChangeEvent<HTMLSelectElement>) {
    props.onChange({ ...props.state, gender: event.target.value });
  }
  function handleObject(event: React.ChangeEvent<HTMLInputElement>) {
    props.onChange({ ...props.state, object: event.target.value });
  }
  return (
    <Container className={styles.mob}>
      <Form.Label>{props.title}</Form.Label>
      <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon1">Character Name</InputGroup.Text>
        <Form.Control
          placeholder={props.state.name}
          aria-label="name"
          aria-describedby="basic-addon1"
          onChange={handleName}
        />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon1">Gender</InputGroup.Text>
        <Form.Select
          aria-label="Default select example"
          onChange={handleGender}
        >
          <option>Gender</option>
          <option value="he">he/him</option>
          <option value="she">she/her</option>
          <option value="they">they/them</option>
          <option value="ve">ve/ver</option>
          <option value="ze">ze/hir</option>
        </Form.Select>
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon1">Object</InputGroup.Text>
        <Form.Control
          placeholder={props.state.object}
          aria-label="name"
          aria-describedby="basic-addon1"
          onChange={handleObject}
        />
      </InputGroup>
    </Container>
  );
}

type MsgEditorProps = {
  story_text: IStoryText;

  handleUpdate: (updated_text: IStoryText) => void;
};

export default function MsgEditor(props: MsgEditorProps) {
  const [actor, setActor] = useState<IActorDetails>({
    name: "Leeroy Jenkins",
    gender: "Male",
    object: "short sword",
  });

  const [subject, setSubject] = useState<IActorDetails>({
    name: "the goblin",
    gender: "Female",
    object: "shield",
  });

  /* this might not be necessary shortly */
  /*
  useEffect(() => {
    setParsed({
      actor: parseText(actor, subject, props.story_outcome.actor_message),
      subject: parseText(actor, subject, props.story_outcome.subject_message),
      room: parseText(actor, subject, props.story_outcome.room_message),
    });
  }, [props, actor, subject]);
*/
  function handleActorChange(event: React.ChangeEvent<HTMLInputElement>) {
    props.story_text.actor_message = event.target.value;
    props.handleUpdate(props.story_text);
  }
  function handleSubjectChange(event: React.ChangeEvent<HTMLInputElement>) {
    props.story_text.subject_message = event.target.value;
    props.handleUpdate(props.story_text);
  }
  function handleRoomChange(event: React.ChangeEvent<HTMLInputElement>) {
    props.story_text.room_message = event.target.value;
    props.handleUpdate(props.story_text);
  }
  const actor_parsed: string = parseText(
    actor,
    subject,
    props.story_text.actor_message
  );
  const subject_parsed: string = parseText(
    actor,
    subject,
    props.story_text.subject_message
  );
  const room_parsed: string = parseText(
    actor,
    subject,
    props.story_text.room_message
  );
  return (
    <>
      <Container>
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">Actor's Message</InputGroup.Text>
          <Form.Control
            aria-label="name"
            aria-describedby="basic-addon1"
            placeholder="You stab %s% with your %a-obj%."
            onChange={handleActorChange}
            value={props.story_text.actor_message}
          />
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">Subject's Message</InputGroup.Text>
          <Form.Control
            aria-label="name"
            aria-describedby="basic-addon1"
            placeholder="%a% stabs you with %a-his% %a-obj%."
            onChange={handleSubjectChange}
            value={props.story_text.subject_message}
          />
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">Room Message</InputGroup.Text>
          <Form.Control
            aria-label="name"
            aria-describedby="basic-addon1"
            placeholder="%a% stabs %s% with %a-his% %a-obj%."
            onChange={handleRoomChange}
            value={props.story_text.room_message}
          />
        </InputGroup>

        <h4>Preview</h4>
        <Row>
          <Col md>
            <MobEditor title="Actor" state={actor} onChange={setActor} />
          </Col>
          <Col md>
            <MobEditor title="Subject" state={subject} onChange={setSubject} />
          </Col>
        </Row>
      </Container>
      <Container className={styles.outputContainer}>
        <div className={styles.output}>
          <span className={styles.outputPov}>Actor sees:</span>
          {actor_parsed}
        </div>
        <div className={styles.output}>
          <span className={styles.outputPov}>Subject sees:</span>
          {subject_parsed}
        </div>
        <div className={styles.output}>
          <span className={styles.outputPov}>Room sees:</span>
          {room_parsed}
        </div>
      </Container>
      <h4>Reference</h4>
      <TemplateTable actor={actor} subject={subject}></TemplateTable>
    </>
  );
}
