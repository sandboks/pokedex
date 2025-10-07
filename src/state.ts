import { createInterface, type Interface } from "readline";

export type CLICommand = {
  name: string;
  description: string;
  //callback: (commands: Record<string, CLICommand>) => void;
  callback: (state: State) => void;
};

//Export a new State type from this file, it should contain the readline interface and the commands registry.
export type State = {
    commands: Record<string, CLICommand>;
    rl: Interface;
}

//Export a new function called initState. Move the logic that creates the readline interface and the commands registry into this function. It should return an initialized State object.
export function initState(): State {
    
    return {
        commands: getCommands(),
        rl: createInterface({
			input: process.stdin,
            output: process.stdout,
            prompt: 'Pokedex> ',
		}),
    }
}

export function getCommands(): Record<string, CLICommand> {
    return {
        help: {
            name: "help",
            description: "lists all commands",
            callback: (state: State) => {
                console.log("=== USAGE: ===\n");
                for (const commandTag in state.commands) {
                    let command = state.commands[commandTag];
                    console.log(`${commandTag}: ${command.description}`);
                }
                console.log("==============\n");
            }
        },
        exit: {
            name: "exit",
            description: "Exits the pokedex",
            callback: (state: State) => {
                console.log("Closing the Pokedex... Goodbye!");
                state.rl.close();
                process.exit(0);
            }
        },
        // can add more commands here
    };
}