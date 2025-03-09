// deno-lint-ignore-file no-explicit-any
import nlp from "compromise";
import { Atoms, Object, Subject, Verb } from "types/output.ts"
import type { Entry as ClientEntry } from "types/input.ts";

function singularise(word:string): string {
  const singular = nlp(word).nouns().toSingular().out("text");
  return singular.length ? singular : word;
}

function isArticle(word:string): boolean {
  return ["a", "an", "the", "some"].includes(word.toLowerCase());
}

function determineQuantity(article:string | null, headWord: string ): (string | number)[] {
  if (article && article.toLowerCase() === "some") { return ["some", "plural"] };

  const pluralTerms = nlp(headWord).nouns().isPlural().text();
  const isPlural:boolean = pluralTerms.length > 0;
  return [isPlural ? "plural" : "singular"];
}

function extractNounDescriptors(phrase:string, head: string): string[] {
  const doc = nlp(phrase);
  // Extract adjectives
  const adjectives = doc.adjectives().out("array");
  // Extract prepositional phrases (e.g. "of the politicians")
  const prepPhrases = doc.match("#Preposition+ #Noun+").out("array");
  // Extract verb phrases used as modifiers (e.g. "called Jason")
  const verbModifiers = doc.match("#Verb+ #ProperNoun+").out("array");
  // Remove any words that match the head noun from adjectives list
  const filteredAdjectives = adjectives.filter((adj: string) =>
    adj.toLowerCase() !== head.toLowerCase()
  );
  return [...filteredAdjectives, ...prepPhrases, ...verbModifiers];
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

function parseNounPhrase(phrase:string): Subject | Object {
  const doc = nlp(phrase);
  const words = phrase.trim().split(/\s+/);

  // Check for an article at the beginning
  let article: string | null = null;
  if (words.length && isArticle(words[0])) {
    article = words[0].toLowerCase();
  }

  // Use Compromise to get the first noun
  const nounDoc = doc.match("#Noun").first();
  const headWord = nounDoc.found
    ? nounDoc.out("text")
    : words[words.length - 1];
  const head: [string, string] = [headWord, headWord];

  // Extract descriptors including verb modifiers
  const descriptors = extractNounDescriptors(phrase, headWord);

  // Add any trailing phrases as descriptors
  const trailingPhrases = doc.match("to .+").out("array");
  if (trailingPhrases.length) {
    descriptors.push(...trailingPhrases);
  }

  const quantity = determineQuantity(article, headWord);

  return {
    head,
    article: article ?? "",
    quantity,
    descriptors,
    phrase: ""
  };
}

function parseVerbPhrase(phrase:string): Verb {
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

  return {
    head,
    phrase: "",
    descriptors
  };
}

export function breaker(entry:ClientEntry): Atoms {
  const doc:any = nlp(entry.input);
  const termData:any = doc.terms().data();

  if (termData.length === 0) { throw new Error("Empty sentence provided") }

  let verbIndex:number = -1;
  for (let i = 0; i < termData.length; i++) {
    const term = termData[i].terms[0];
    if (term.tags.includes("Verb") && !term.tags.includes("Auxiliary")) {
      if (term.normal === "called" && i < termData.length - 1) {
        const nextTerm = termData[i + 1].terms[0];
        if (nextTerm.tags.includes("ProperNoun")) continue;
      }
      verbIndex = i;
      break;
    }
  }

  let subjectEndIndex:number = verbIndex;
  if (verbIndex > 0 && termData[verbIndex - 1].terms[0].tags.includes("Adverb")) {
    subjectEndIndex = verbIndex - 1;
  }

  const subjectTerms:string[] = termData.slice(0, subjectEndIndex).map((t: any) => {
    if (!t.terms[0].tags.includes("Auxiliary")) {
      return t.text;
    }
    return "";
  }).filter(Boolean);
  const subjectPhrase:string = subjectTerms.join(" ");

  const verbTerms:string[] = [];
  for (let i:number = subjectEndIndex; i < verbIndex; i++) {
    if (
      termData[i].terms[0].tags.includes("Auxiliary") ||
      termData[i].terms[0].tags.includes("Adverb")
    ) {
      verbTerms.push(termData[i].text);
    }
  }
  verbTerms.push(termData[verbIndex].text);

  let i:number = verbIndex + 1;
  while (i < termData.length && termData[i].terms[0].tags.includes("Adverb")) {
    verbTerms.push(termData[i].text);
    i++;
  }
  let verbPhrase:string = verbTerms.join(" ");

  const objectTerms:string[] = termData.slice(i).map((t: any) => t.text);
  if (objectTerms.length > 0) {
    const lastToken = termData[termData.length - 1];
    if (lastToken.terms[0].tags.includes("Adverb")) {
      verbPhrase = verbPhrase + " " + objectTerms.pop();
    }
  }
  const objectPhrase:string = objectTerms.join(" ");

  const subject:Subject = parseNounPhrase(subjectPhrase);
  const verb:Verb = parseVerbPhrase(verbPhrase);
  const object:Object = parseNounPhrase(objectPhrase);

  return { subject, verb, object };
}
