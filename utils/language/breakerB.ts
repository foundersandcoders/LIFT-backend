import nlp from "compromise";
import { Grammar, Subject, Verb, Object } from "../types/languageB.ts";

export function breaker(input: string): Grammar {
  const doc = nlp(input);
  
  const nounSubject = doc.nouns().json();
  const verbs = doc.verbs().json();
  const nounObject = doc.match("#Noun$").json(); // Last noun often an object

  function processNoun(nounData: any) :Subject|Object {
    if (!nounData) { return {
        base: "",
        quantity: "singular",
        article: "none",
        descriptors: []
    }};
    
    return {
      base: nounData?.text || "",
      quantity: nounData?.tags.includes("Plural") ? "plural" : "singular",
      article: nounData?.tags.includes("Determiner") ? "definite" : "none",
      descriptors: nounData?.terms.filter((t: any) => t.tags.includes("Adjective")).map((t: any) => t.text) || []
    };
  }

  function processVerb(verbData: any) :Verb {
    if (!verbData) { return { 
        base: "",
        descriptors: []
    }};

    return {
        base: verbData?.text || "",
        descriptors: verbData?.terms
            .filter((t: any) => t.tags.includes("Adverb"))
            .map((t: any) => t.text)
        || []
    };
  }

  return {
    subject: processNoun(nounSubject[0]),
    verb: processVerb(verbs[0]),
    object: processNoun(nounObject[0]),
  };
}