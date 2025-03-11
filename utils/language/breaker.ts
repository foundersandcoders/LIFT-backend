// deno-lint-ignore-file no-explicit-any
import nlp from "compromise";
import {
  Atoms as ServerAtoms,
  Object as ServerObject,
  Subject as ServerSubject,
  Verb as ServerVerb
} from "types/outputTypes.ts"
import type { Entry as ClientEntry } from "types/inputTypes.ts";

function singularise(word:string): string {
  const singular = nlp(word).nouns().toSingular().out("text");
  return singular.length ? singular : word;
}

function isArticle(word:string): boolean {
  return ["a", "an", "the", "some"].includes(word.toLowerCase());
}

function determineQuantity(article:string | null, headWord: string ): (string | number)[] {
  console.groupCollapsed(`=== determineQuantity(${article}, ${headWord}) ===`);
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
  console.log(articleArray);

  console.groupEnd();
  return articleArray;
}

function extractNounDescriptors(phrase: string, head: string): string[] {
  console.groupCollapsed(`=== extractNounDescriptors(${phrase}, ${head}) ===`);
  const doc = nlp(phrase);
  
  const adjectives: string[] = doc.adjectives().out("array");
  if (adjectives.length) console.log(`adjectives: ${adjectives}`);

  const prepPhrases: string[] = doc.match("#Preposition+ #Noun+").out("array");
  if (prepPhrases.length) console.log(`prepPhrases: ${prepPhrases}`);

  const verbModifiers:string[] = doc.match("#Verb+ #ProperNoun+").out("array");
  if (verbModifiers.length) console.log(`verbModifiers: ${verbModifiers}`);

  const filteredAdjectives:string[] = adjectives.filter((adj: string) =>
    adj.toLowerCase() !== head.toLowerCase()
  );
  if (filteredAdjectives.length) console.log(`filteredAdjectives: ${filteredAdjectives}`);

  if (!filteredAdjectives.length && !prepPhrases.length && !verbModifiers.length) {
    console.log("No descriptors found");
  }

  console.groupEnd();
  return [
    ...filteredAdjectives,
    ...prepPhrases,
    ...verbModifiers
  ];
}

function extractVerbDescriptors(phrase:string, head: string): string[] {
  const doc = nlp(phrase);
  const descriptors: string[] = [];

  // Extract auxiliary verbs
  const auxiliaries = doc.match("#Auxiliary+").out("array");
  if (auxiliaries.length) descriptors.push(...auxiliaries);

  // Extract adverbs
  const adverbs = doc.adverbs().out("array");
  if (adverbs.length) descriptors.push(...adverbs);

  // Remove the head verb if accidentally included
  return descriptors.filter((desc) =>
    desc.toLowerCase() !== head.toLowerCase()
  );
}

function parseNounPhrase(phrase: string): ServerSubject | ServerObject {
  console.groupCollapsed(`=== parseNounPhrase(${phrase}) ===`);
  const doc = nlp(phrase);

  const words = phrase.trim().split(/\s+/);
  console.log(`words: ${words}`);
  
  let article: string | null = null;
  if (words.length && isArticle(words[0])) {
    article = words[0].toLowerCase();
  }

  const nounDoc = doc.match("#Noun").first();
  const headWord = nounDoc.found
    ? nounDoc.out("text")
    : words[words.length - 1];
  const head: [string, string] = [headWord, headWord];
  console.log(`headWord: ${headWord}`);

  const descriptors = extractNounDescriptors(phrase, headWord);

  const trailingPhrases = doc.match("to .+").out("array");
  if (trailingPhrases.length) {
    descriptors.push(...trailingPhrases);
  }

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
  console.groupCollapsed(`=== parseVerbPhrase(${phrase}) ===`);
  const doc = nlp(phrase);

  // First, get all verbs and filter out auxiliaries
  const verbs = doc.verbs().out("array");
  const mainVerb = verbs.find((v: string) =>
    !nlp(v).has("#Auxiliary") &&
    !nlp(v).has("#Adverb")
  ) || phrase.trim();

  // Get the infinitive form of just the main verb
  const verbInfinitive = nlp(mainVerb).verbs().toInfinitive().out("text") ||
    mainVerb;

  // Get auxiliary verbs in order
  const auxiliaries = doc.match("#Auxiliary+").out("array");

  // Get adverbs
  const descriptors = doc.adverbs().out("array");

  // Build the full verb phrase: auxiliaries + main verb
  const fullVerbPhrase = auxiliaries.length
  ? `${auxiliaries.join(" ")} ${mainVerb}`
  : mainVerb;

  const head:[string, string] = [verbInfinitive, fullVerbPhrase];

  console.groupEnd();

  return {
    head,
    phrase: "",
    descriptors
  };
}

export function breaker(entry: ClientEntry): ServerAtoms {
  console.groupCollapsed(`=== breaker(${entry.input}) ===`);

  const doc: any = nlp(entry.input);  
  const termData: any = doc.terms().data();
  
  console.groupCollapsed("=== TERM TAGS ===");
  // [ ] tdLo: enfore the noun tag in the subject atom
  for (const termDatum of termData) {
    const tags: string[] = termDatum.terms[0].tags;
    console.log(`${termDatum.text}: ${tags}`);
  }
  console.groupEnd();

  if (termData.length === 0) {
    throw new Error("Empty sentence provided");
  };

  console.groupCollapsed("=== VERB INDEX ===");
  let verbIndex: number = -1;
  for (let i = 0; i < termData.length; i++) {
    const term = termData[i].terms[0];
    console.log(`${i}: ${term.text}`);
    if (term.tags.includes("Verb") && !term.tags.includes("Auxiliary")) {
      console.log(`${term.text} is a verb`);
      if (term.normal === "called" && i < termData.length - 1) {
        console.groupCollapsed(`=== ${term.normal} ===`);
        console.log(term.normal);
        const nextTerm = termData[i + 1].terms[0];
        console.log(`nextTerm: ${nextTerm.text}`);
        console.groupEnd();

        if (nextTerm.tags.includes("ProperNoun")) {
          console.log(`${nextTerm.text} is a proper noun - skipping`);
          continue;
        };
      }
      verbIndex = i;
      console.log(`verbIndex: ${verbIndex}`);
      break;
    }
  }
  console.groupEnd();

  let subjectEndIndex:number = verbIndex;
  if (verbIndex > 0 && termData[verbIndex - 1].terms[0].tags.includes("Adverb")) {
    subjectEndIndex = verbIndex - 1
  };

  console.groupCollapsed(`=== TERMS ===`);
  const subjectTerms: string[] = termData.slice(0, subjectEndIndex).map((t: any) => {
    if (!t.terms[0].tags.includes("Auxiliary")) {
      console.log(`${t.text} is not auxiliary`);
      return t.text;
    } else {
      console.log(`${t.text} is auxiliary - skipping`);
      return "";
    };
  }).filter(Boolean);
  const subjectPhrase:string = subjectTerms.join(" ");
  console.log(`subjectPhrase: ${subjectPhrase}`);

  const verbTerms: string[] = [];
  for (let i: number = subjectEndIndex; i < verbIndex; i++) {
    console.groupCollapsed(termData[i].text);
    if (
      termData[i].terms[0].tags.includes("Auxiliary") ||
      termData[i].terms[0].tags.includes("Adverb")
    ) {
      console.log(`${termData[i].text} is auxiliary`);
      verbTerms.push(termData[i].text);
    }
    console.groupEnd();
  }
  verbTerms.push(termData[verbIndex].text);
  let i:number = verbIndex + 1;
  while (i < termData.length && termData[i].terms[0].tags.includes("Adverb")) {
    verbTerms.push(termData[i].text);
    i++;
  }
  let verbPhrase: string = verbTerms.join(" ");
  console.log(`verbPhrase: ${verbPhrase}`);

  const objectTerms:string[] = termData.slice(i).map((t: any) => t.text);
  if (objectTerms.length > 0) {
    const lastToken = termData[termData.length - 1];
    if (lastToken.terms[0].tags.includes("Adverb")) {
      verbPhrase = verbPhrase + " " + objectTerms.pop();
    }
  }
  const objectPhrase:string = objectTerms.join(" ");
  console.log(`objectPhrase: ${objectPhrase}`);
  console.groupEnd();

  console.groupCollapsed("=== PARSER FUNCTIONS ==="); 
  const subject:ServerSubject = parseNounPhrase(subjectPhrase);
  const verb:ServerVerb = parseVerbPhrase(verbPhrase);
  const object:ServerObject = parseNounPhrase(objectPhrase);
  console.groupEnd();


  console.groupEnd();
  return { subject, verb, object };
}