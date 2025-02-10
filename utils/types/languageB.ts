export interface Grammar {
    subject: Subject;
    verb: Verb;
    object: Object;
}

export interface Subject {
    base: string;
    quantity: "singular" | "plural";
    article: "definite" | "indefinite" | "none";
    descriptors: string[];
}

export interface Verb {
    base: string;
    descriptors: string[];
}

export interface Object {
    base: string;
    quantity: "singular" | "plural";
    article: "definite" | "indefinite" | "none";
    descriptors: string[];
}