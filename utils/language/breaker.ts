// deno-lint-ignore-file no-explicit-any
import nlp from "compromise";
import {
  Atoms as ServerAtoms,
  Object as ServerObject,
  Subject as ServerSubject,
  Verb as ServerVerb
} from "../../types/beaconTypes.ts"
import type { Entry as ClientEntry } from "types/inputTypes.ts";

function singularise(word: string): string {
  console.info(`function singularise(${word})`);
  const singular = nlp(word).nouns().toSingular().out("text");
  return singular.length ? singular : word;
}

function isArticle(word: string): boolean {
  console.info(`function isArticle(${word})`);
  const result = ["a", "an", "the", "some"].includes(word.toLowerCase());

  return result;
}

function determineQuantity(article:string | null, headWord: string ): (string | number)[] {
  console.info(`function determineQuantity(${article}, ${headWord})`);
  const articleArray = []
  if (article && article.toLowerCase() === "some") {
    articleArray.push("some");
    articleArray.push("plural");
  } else {
    const pluralTerms = nlp(headWord).nouns().isPlural().text();
    const isPlural: boolean = pluralTerms.length > 0;

    if (isPlural) {
      articleArray.push("plural");
    } else {
      articleArray.push("singular");
    }
  }  
  // console.log(articleArray);

  return articleArray;
}

function extractNounDescriptors(phrase:string, head:string): string[] {
  console.info(`function extractNounDescriptors(${phrase}, ${head})`);
  const doc = nlp(phrase);
  const adj:string[] = doc.adjectives().out("array");
  const preps:string[] = doc.match("#Preposition+ #Noun+").out("array");
  const mods:string[] = doc.match("#Verb+ #ProperNoun+").out("array");
  const filtered:string[] = adj.filter((adj: string) => adj.toLowerCase() !== head.toLowerCase());

  return [...filtered, ...preps, ...mods];
}

function extractVerbDescriptors(phrase:string, head: string): string[] {
  console.info(`function extractVerbDescriptors(${phrase}, ${head})`);
  const doc = nlp(phrase);
  const descriptors: string[] = [];

  const auxiliaries = doc.match("#Auxiliary+").out("array");
  if (auxiliaries.length) descriptors.push(...auxiliaries);

  const adverbs = doc.adverbs().out("array");
  if (adverbs.length) descriptors.push(...adverbs);
  
  return descriptors.filter((desc) => desc.toLowerCase() !== head.toLowerCase());
}

function parseNounPhrase(phrase: string): ServerSubject | ServerObject {
  console.info(`function parseNounPhrase(${phrase})`);
  const doc = nlp(phrase);
  const words = phrase.trim().split(/\s+/);

  let article: string | null = null;
  if (words.length && isArticle(words[0])) article = words[0].toLowerCase();
  const nounDoc = doc.match("#Noun").first();
  const headWord = nounDoc.found
    ? nounDoc.out("text")
    : words[words.length - 1];
  const head: [string, string] = [headWord, headWord];

  console.groupCollapsed(`--- Extract Descriptors ---`);
  const descriptors = extractNounDescriptors(phrase, headWord);
  console.groupEnd();

  const trailingPhrases = doc.match("to .+").out("array");
  if (trailingPhrases.length) descriptors.push(...trailingPhrases);

  console.groupCollapsed(`--- Determine Quantity ---`);
  const quantity = determineQuantity(article, headWord);
  console.groupEnd();

  return {
    head,
    article: article ?? "",
    quantity,
    descriptors,
    phrase: ""
  };
}

function parseVerbPhrase(phrase: string): ServerVerb {
  console.info(`function parseVerbPhrase(${phrase})`);
  const doc = nlp(phrase);
  const verbs = doc.verbs().out("array");
  const mainVerb = verbs.find((v: string) =>
    !nlp(v).has("#Auxiliary") &&
    !nlp(v).has("#Adverb")
  ) || phrase.trim();
  const verbInfinitive = nlp(mainVerb).verbs().toInfinitive().out("text") || mainVerb;
  const auxiliaries = doc.match("#Auxiliary+").out("array");
  const descriptors = doc.adverbs().out("array");
  const fullVerbPhrase = auxiliaries.length
    ? `${auxiliaries.join(" ")} ${mainVerb}`
    : mainVerb;
  const head:[string, string] = [verbInfinitive, fullVerbPhrase];

  return {
    head,
    phrase: "",
    descriptors
  };
}

export function breaker(entry: ClientEntry): ServerAtoms {
  console.groupCollapsed(`====== FUNCTION breaker(${entry.input}) ======`);
  const doc: any = nlp(entry.input);
  const termData: any = doc.terms().data();

  console.groupCollapsed("--- Term Tags ---");
  // [ ] tdLo: enfore the noun tag in the subject atom
  // for (const termDatum of termData) {
  //   const tags: string[] = termDatum.terms[0].tags;
  //   console.log(`${termDatum.text}: ${tags}`);
  // }
  console.groupEnd();

  if (termData.length === 0) throw new Error("Empty sentence provided");

  console.groupCollapsed("--- Verb Index ---");
  let verbIndex: number = -1;
  for (let i = 0; i < termData.length; i++) {
    const term = termData[i].terms[0];
    // console.log(`${i}: ${term.text}`);
    if (term.tags.includes("Verb") && !term.tags.includes("Auxiliary")) {
      // console.log(`${term.text} is a verb`);
      if (term.normal === "called" && i < termData.length - 1) {
        // console.log(term.normal);
        const nextTerm = termData[i + 1].terms[0];
        // console.log(`nextTerm: ${nextTerm.text}`);
        if (nextTerm.tags.includes("ProperNoun")) {
          // console.log(`${nextTerm.text} is a proper noun - skipping`);
          continue;
        };
      }
      verbIndex = i;
      // console.log(`verbIndex: ${verbIndex}`);
      break;
    }
  }
  console.groupEnd();

  let subjectEndIndex:number = verbIndex;
  if (verbIndex > 0 && termData[verbIndex - 1].terms[0].tags.includes("Adverb")) subjectEndIndex = verbIndex - 1;

  console.groupCollapsed("--- Terms ---");
  const subjectTerms: string[] = termData.slice(0, subjectEndIndex).map((t: any) => {
    if (!t.terms[0].tags.includes("Auxiliary")) {
      // console.log(`${t.text} is not auxiliary`);
      return t.text;
    } else {
      // console.log(`${t.text} is auxiliary - skipping`);
      return "";
    };
  }).filter(Boolean);
  const subjectPhrase:string = subjectTerms.join(" ");
  // console.log(`subjectPhrase: ${subjectPhrase}`);
  const verbTerms: string[] = [];
  for (let i: number = subjectEndIndex; i < verbIndex; i++) {
    if (
      termData[i].terms[0].tags.includes("Auxiliary") ||
      termData[i].terms[0].tags.includes("Adverb")
    ) {
      // console.log(`${termData[i].text} is auxiliary`);
      verbTerms.push(termData[i].text);
    }
  }
  verbTerms.push(termData[verbIndex].text);
  let i:number = verbIndex + 1;
  while (i < termData.length && termData[i].terms[0].tags.includes("Adverb")) {
    verbTerms.push(termData[i].text);
    i++;
  }
  let verbPhrase: string = verbTerms.join(" ");
  // console.log(`verbPhrase: ${verbPhrase}`);
  const objectTerms: string[] = termData.slice(i).map((t: any) => {
    return t.text
  });
  if (objectTerms.length > 0) {
    const lastToken = termData[termData.length - 1];
    if (lastToken.terms[0].tags.includes("Adverb")) {
      verbPhrase = verbPhrase + " " + objectTerms.pop();
    }
  }
  const objectPhrase:string = objectTerms.join(" ");
  // console.log(`objectPhrase: ${objectPhrase}`);
  console.groupEnd();

  console.groupCollapsed("--- Parser Functions ---"); 
  const subject:ServerSubject = parseNounPhrase(subjectPhrase);
  const verb:ServerVerb = parseVerbPhrase(verbPhrase);
  const object:ServerObject = parseNounPhrase(objectPhrase);
  console.groupEnd();

  console.groupEnd();

  return { subject, verb, object };
}