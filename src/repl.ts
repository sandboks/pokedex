export function cleanInput(input: string): string[] {
    input = input.trim().toLowerCase();
    return input.split(/\s+/);
}

import { createInterface, type Interface } from "readline";
const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Pokedex> ',
});

rl.on('line', (line: string) => {
    let cleanedInput = cleanInput(line);
    let input = cleanedInput[0];

    switch (input) {
        case '':
            break;
        case 'hello':
            console.log("world");
            break;
        default:
            console.log(`Command: '${input}'`);
            break;
    }
    rl.prompt();
}).on('close', () => {
    console.log('Have a great day!');
    process.exit(0);
});

export function startREPL() {
    rl.prompt();
}