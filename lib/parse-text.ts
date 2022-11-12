import { IActorDetails } from "../models/story";
// TODO: all these genders should be enums

export function possessiveName(name: string) {
  if (!name || name.length == 0) return "";

  if (name[name.length] === "s") {
    name = name + "'";
  } else {
    name = name + "'s";
  }

  return name;
}

export function genderPossessive(gender: string) {
  switch (gender) {
    case "he":
      return "his";
    case "she":
      return "her";
    case "they":
      return "their";
    case "ve":
      return "vis";
    case "ze":
      return "hir";
    default:
      return "his";
  }
}

export function genderObject(gender: string) {
  switch (gender) {
    case "he":
      return "him";
    case "she":
      return "her";
    case "they":
      return "them";
    case "ve":
      return "ver";
    case "ze":
      return "hir";
    default:
      return "him";
  }
}

export function genderSubject(gender: string) {
  switch (gender) {
    case "he":
      return "he";
    case "she":
      return "she";
    case "they":
      return "they";
    case "ve":
      return "ve";
    case "ze":
      return "ze";
    default:
      return "he";
  }
}

export function genderPossessivePronoun(gender: string) {
  switch (gender) {
    case "he":
      return "his";
    case "she":
      return "hers";
    case "they":
      return "theirs";
    case "ve":
      return "vis";
    case "ze":
      return "hirs";
    default:
      return "his";
  }
}

export function genderReflexive(gender: string) {
  switch (gender) {
    case "he":
      return "himself";
    case "she":
      return "herself";
    case "they":
      return "themself";
    case "ve":
      return "verself";
    case "ze":
      return "hirself";
    default:
      return "himself";
  }
}

export function parseText(
  actorState: IActorDetails,
  subjectState: IActorDetails,
  message: string
) {
  if (message.length <= 1) return "";
  const matchText: { [key: string]: string } = {
    "%a%": actorState.name,
    "%as%": possessiveName(actorState.name),
    "%a-he%": genderSubject(actorState.gender),
    "%a-him%": genderObject(actorState.gender),
    "%a-his%": genderPossessive(actorState.gender),
    "%a-hers%": genderPossessivePronoun(actorState.gender),
    "%a-himself%": genderReflexive(actorState.gender),
    "%a-obj%": actorState.object,
    "%s%": subjectState.name,
    "%ss%": possessiveName(subjectState.name),
    "%s-he%": genderSubject(subjectState.gender),
    "%s-him%": genderObject(subjectState.gender),
    "%s-his%": genderPossessive(subjectState.gender),
    "%s-hers%": genderPossessivePronoun(subjectState.gender),
    "%s-himself%": genderReflexive(subjectState.gender),
    "%s-obj%": subjectState.object,
  };

  const re = new RegExp(Object.keys(matchText).join("|"), "g");
  const msg = message.replace(re, (match: string) => matchText[match]);

  return msg[0].toUpperCase() + msg.substring(1);
}
