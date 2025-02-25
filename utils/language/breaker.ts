// deno-lint-ignore-file no-explicit-any
import nlp from "compromise";
import { Grammar, Object, Subject, Verb } from "../../types/language.ts";

// -------------------------------------------------------------------------
// Helper functions

/**
 * Convert a word to its singular form using Compromise.
 * If Compromise returns an empty string, fallback to the original word.
 */
function singularise(word: string): string {
  const singular = nlp(word).nouns().toSingular().out("text");
  return singular.length ? singular : word;
}

/**
 * Check if a token is an article.
 */
function isArticle(word: string): boolean {
  return ["a", "an", "the", "some"].includes(word.toLowerCase());
}

/**
 * Determine quantity based on an article or the noun's plurality.
 */
function determineQuantity(
  article: string | null,
  headWord: string,
): (string | number)[] {
  if (article && article.toLowerCase() === "some") {
    return ["some", "plural"];
  }
  const isPlural = nlp(headWord).nouns().isPlural().out("boolean");
  return [isPlural ? "plural" : "singular"];
}

/**
 * Extract descriptors for a noun phrase.
 * This function gathers adjectives, prepositional phrases, and other modifiers as descriptors.
 */
function extractNounDescriptors(phrase: string, head: string): string[] {
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

/**
 * Extract verb descriptors including auxiliary verbs and adverbs.
 */
function extractVerbDescriptors(phrase: string, head: string): string[] {
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

/**
 * Parse a noun phrase into either a Subject or an Object.
 */
function parseNounPhrase(phrase: string): Subject | Object {
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

  return { head, article: article ?? undefined, quantity, descriptors };
}

/**
 * Parse a verb phrase into a Verb object.
 */
function parseVerbPhrase(phrase: string): Verb {
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
  const adverbs = doc.adverbs().out("array");

  // Build the full verb phrase: auxiliaries + main verb
  const fullVerbPhrase = auxiliaries.length
    ? `${auxiliaries.join(" ")} ${mainVerb}`
    : mainVerb;

  const head: [string, string] = [verbInfinitive, fullVerbPhrase];

  return { head, descriptors: adverbs };
}

/**
 * Parse a full sentence into its grammatical components (subject, verb, object).
 *
 * This updated implementation uses Compromise's token (term) data to more accurately split the sentence.
 * It then applies heuristics:
 * - If an adverb immediately precedes the head verb, it is attached to the verb.
 * - If the final token of the sentence is an adverb, it is reattached to the verb.
 */
export function breaker(sentence: string): Grammar {
  // console.groupCollapsed(`=== Breaker ===`);
  const doc: any = nlp(sentence);

  // console.log(`doc: ${doc}`);

  const termData = doc.terms().data();

  // console.log(`termData: ${termData}`);

  if (termData.length === 0) {
    throw new Error("Empty sentence provided");
  }

  let verbIndex = -1;
  // console.log(`verbIndex: ${verbIndex}`);

  // console.groupCollapsed(`=== Looping through termData ===`);
  for (let i = 0; i < termData.length; i++) {
    const term = termData[i].terms[0];
    // console.log(`term: ${term}`);
    if (term.tags.includes("Verb") && !term.tags.includes("Auxiliary")) {
      if (term.normal === "called" && i < termData.length - 1) {
        const nextTerm = termData[i + 1].terms[0];
        if (nextTerm.tags.includes("ProperNoun")) continue;
      }
      verbIndex = i;
      // console.log(`verbIndex: ${verbIndex}`);
      break;
    }
  }
  // console.groupEnd();

  if (verbIndex === -1) {
    // console.log(`verbIndex: ${verbIndex}`);
    return {
      subject: parseNounPhrase(""),
      verb: parseVerbPhrase(sentence),
    };
  }

  let subjectEndIndex = verbIndex;
  // console.log(`subjectEndIndex: ${subjectEndIndex}`);

  if (
    verbIndex > 0 && termData[verbIndex - 1].terms[0].tags.includes("Adverb")
  ) {
    subjectEndIndex = verbIndex - 1;
    // console.log(`subjectEndIndex: ${subjectEndIndex}`);
  }

  const subjectTerms = termData.slice(0, subjectEndIndex).map((t: any) => {
    // Skip auxiliary verbs in the subject
    if (!t.terms[0].tags.includes("Auxiliary")) {
      return t.text;
    }
    return "";
  }).filter(Boolean);
  // console.log(`subjectTerms: ${subjectTerms}`);

  const subjectPhrase = subjectTerms.join(" ");
  // console.log(`subjectPhrase: ${subjectPhrase}`);

  const verbTerms: string[] = [];
  // console.log(`verbTerms: ${verbTerms}`);
  for (let i = subjectEndIndex; i < verbIndex; i++) {
    if (
      termData[i].terms[0].tags.includes("Auxiliary") ||
      termData[i].terms[0].tags.includes("Adverb")
    ) {
      verbTerms.push(termData[i].text);
    }
  }

  verbTerms.push(termData[verbIndex].text);
  // console.log(`verbTerms: ${verbTerms}`);

  let i = verbIndex + 1;
  while (i < termData.length && termData[i].terms[0].tags.includes("Adverb")) {
    // console.log(`verbIndex[${i}]: ${termData[i].text}`);
    verbTerms.push(termData[i].text);
    i++;
  }
  let verbPhrase = verbTerms.join(" ");
  // console.log(`verbPhrase: ${verbPhrase}`);

  const objectTerms = termData.slice(i).map((t: any) => t.text);
  // console.log(`objectTerms: ${objectTerms}`);
  if (objectTerms.length > 0) {
    const lastToken = termData[termData.length - 1];
    // console.log(`lastToken: ${lastToken}`);
    if (lastToken.terms[0].tags.includes("Adverb")) {
      // console.log(`verbPhrase: ${verbPhrase}`);
      verbPhrase = verbPhrase + " " + objectTerms.pop();
      // console.log(`verbPhrase: ${verbPhrase}`);
    }
  }
  const objectPhrase = objectTerms.join(" ");
  // console.log(`objectPhrase: ${objectPhrase}`);

  const subject = subjectPhrase
    ? parseNounPhrase(subjectPhrase)
    : { head: ["", ""], quantity: [] };
  // console.log(`subjectPhrase: ${subjectPhrase}`);

  const verb = parseVerbPhrase(verbPhrase);
  // console.log(`verb: ${verb}`);

  const object = objectPhrase ? parseNounPhrase(objectPhrase) : undefined;
  // console.log(`object: ${object}`);

  // console.groupEnd();

  return { subject, verb, object };
}

// -------------------------------------------------------------------------
// Example usage & testing with provided inputs

if (import.meta.main) {
  const examples = [
    "The young children of the politicians deliberately disobeyed explicit orders",
    "The young children of the politicians disobeyed explicit orders deliberately",
    "The young children of the politicians deliberately disobeyed their parents' explicit orders",
  ];
  for (const sentence of examples) {
    console.log("Input:", sentence);
    console.log("Parsed:", JSON.stringify(breaker(sentence), null, 2));
    console.log("----------");
  }
}
