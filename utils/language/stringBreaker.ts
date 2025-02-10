// import nlp from "https://cdn.skypack.dev/compromise";
import nlp from "npm:compromise@14.10.0";
import { Subject, Object, Verb, Grammar } from "../interfaces.ts";

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
function determineQuantity(article: string | null, headWord: string): (string | number)[] {
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
  const filteredAdjectives = adjectives.filter(adj => adj.toLowerCase() !== head.toLowerCase());
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
  return descriptors.filter(desc => desc.toLowerCase() !== head.toLowerCase());
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
  let headWord = nounDoc.found ? nounDoc.out("text") : words[words.length - 1];
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
  const verbs = doc.verbs().out('array');
  const mainVerb = verbs.find(v => 
    !nlp(v).has('#Auxiliary') && 
    !nlp(v).has('#Adverb')
  ) || phrase.trim();
  
  // Get the infinitive form of just the main verb
  const verbInfinitive = nlp(mainVerb).verbs().toInfinitive().out('text') || mainVerb;
  
  // Get auxiliary verbs in order
  const auxiliaries = doc.match('#Auxiliary+').out('array');
  
  // Get adverbs
  const adverbs = doc.adverbs().out('array');
  
  // Build the full verb phrase: auxiliaries + main verb
  const fullVerbPhrase = auxiliaries.length ? 
    `${auxiliaries.join(' ')} ${mainVerb}` : 
    mainVerb;
  
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
export function parseSentence(sentence: string): Grammar {
  const doc = nlp(sentence);
  const termData = doc.terms().data();

  if (termData.length === 0) {
    throw new Error("Empty sentence provided");
  }

  // Find the main verb phrase, skipping auxiliary verbs
  let verbIndex = -1;
  for (let i = 0; i < termData.length; i++) {
    const term = termData[i].terms[0];
    // Check if it's a verb but not an auxiliary verb
    if (term.tags.includes("Verb") && !term.tags.includes("Auxiliary")) {
      // If it's "called", check if it's being used as a naming verb
      if (term.normal === "called" && i < termData.length - 1) {
        const nextTerm = termData[i + 1].terms[0];
        // If followed by a proper noun, skip this verb
        if (nextTerm.tags.includes("ProperNoun")) {
          continue;
        }
      }
      verbIndex = i;
      break;
    }
  }

  if (verbIndex === -1) {
    return { 
      subject: parseNounPhrase(""), 
      verb: parseVerbPhrase(sentence) 
    };
  }

  // Adjust subject boundary: if the term immediately before the verb is an adverb, remove it from subject
  let subjectEndIndex = verbIndex;
  if (verbIndex > 0 && termData[verbIndex - 1].terms[0].tags.includes("Adverb")) {
    subjectEndIndex = verbIndex - 1;
  }

  // Build subject phrase, including any auxiliary verbs before the main verb
  const subjectTerms = termData.slice(0, subjectEndIndex).map(t => {
    // Skip auxiliary verbs in the subject
    if (!t.terms[0].tags.includes("Auxiliary")) {
      return t.text;
    }
    return "";
  }).filter(Boolean); // Remove empty strings
  const subjectPhrase = subjectTerms.join(" ");

  // Build verb phrase, including auxiliary verbs
  let verbTerms: string[] = [];
  // Include auxiliary verbs that come before the main verb
  for (let i = subjectEndIndex; i < verbIndex; i++) {
    if (termData[i].terms[0].tags.includes("Auxiliary") || 
        termData[i].terms[0].tags.includes("Adverb")) {
      verbTerms.push(termData[i].text);
    }
  }
  // Add the main verb
  verbTerms.push(termData[verbIndex].text);
  
  // Add following adverbs
  let i = verbIndex + 1;
  while (i < termData.length && termData[i].terms[0].tags.includes("Adverb")) {
    verbTerms.push(termData[i].text);
    i++;
  }
  let verbPhrase = verbTerms.join(" ");

  // Build object phrase from remaining tokens
  let objectTerms = termData.slice(i).map(t => t.text);
  // Handle final adverb
  if (objectTerms.length > 0) {
    const lastToken = termData[termData.length - 1];
    if (lastToken.terms[0].tags.includes("Adverb")) {
      verbPhrase = verbPhrase + " " + objectTerms.pop();
    }
  }
  const objectPhrase = objectTerms.join(" ");

  const subject = subjectPhrase ? parseNounPhrase(subjectPhrase) : { head: ["", ""], quantity: [] };
  const verb = parseVerbPhrase(verbPhrase);
  const object = objectPhrase ? parseNounPhrase(objectPhrase) : undefined;

  return { subject, verb, object };
}

// -------------------------------------------------------------------------
// Example usage & testing with provided inputs

if (import.meta.main) {
  const examples = [
    "The young children of the politicians deliberately disobeyed explicit orders",
    "The young children of the politicians disobeyed explicit orders deliberately",
    "The young children of the politicians deliberately disobeyed their parents' explicit orders"
  ];
  for (const sentence of examples) {
    console.log("Input:", sentence);
    console.log("Parsed:", JSON.stringify(parseSentence(sentence), null, 2));
    console.log("----------");
  }
}