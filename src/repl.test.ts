import { cleanInput } from "./repl";
import { describe, expect, test } from "vitest";

//usage: npm run test

const testCases = [
    {
        input: "",
        expected: [""],
    },
    {
        input: "  hello  world  ",
        expected: ["hello", "world"],
    },
    {
        input: "  HeLLO  world  ",
        expected: ["hello", "world"],
    },
    {
        input: "I don't even know, man",
        expected: ["i", "don't", "even", "know,", "man"],
    },
];

describe("cleanInput", () => {
    test.each(testCases)("should clean input \"$input\"", ({ input, expected }) => {
        // Execution
        const actual = cleanInput(input);

        // Assertions
        expect(actual).toEqual(expected);
    });
});