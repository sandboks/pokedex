import { initState } from "./state.js";
import type { State } from "./state.js";

export function cleanInput(input: string): string[] {
    input = input.trim().toLowerCase();
    return input.split(/\s+/);
}

export async function startREPL() {
    let state: State = initState();
    
    console.log("Welcome to the Pokedex! Enter a command");
    state.rl.prompt();
    state.rl.on('line', async (line: string) => {
        let cleanedInput = cleanInput(line);
        let input = cleanedInput;
        
        if (input[0] in state.commands) {
            await state.commands[input[0]].callback(state, ...input.slice(1));
        }
        else {
            console.log("Not found");
        }
        state.rl.prompt(); 
    });
}

