import { createInterface, type Interface } from "readline";
import { PokeAPI, LocationData, LocationEncounters } from "./pokeapi.js";

export type CLICommand = {
    //name: string; // this is redundant, and will never be used :/
    description: string;
    //callback: (state: State) => void;
    //callback: (state: State) => Promise<void>;
    callback: (state: State, ...args: string[]) => Promise<void>;
};

//Export a new State type from this file, it should contain the readline interface and the commands registry.
export type State = {
    commands: Record<string, CLICommand>;
    rl: Interface;
    pokeapi: PokeAPI;
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
        pokeapi: new PokeAPI(),
    }
}

export function getCommands(): Record<string, CLICommand> {
    return {
        help: {
            description: "lists all commands",
            callback: async (state: State) => {
                console.log("=== USAGE: ===");
                for (const commandTag in state.commands) {
                    let command = state.commands[commandTag];
                    console.log(`${commandTag}: ${command.description}`);
                }
                console.log("==============\n");
            }
        },
        exit: {
            description: "Exits the pokedex",
            callback: async (state: State) => {
                console.log("Closing the Pokedex... Goodbye!");
                state.rl.close();
                process.exit(0);
            }
        },
        map: {
            description: "Display a list of locations",
            callback: async (state: State) => {
                let data = await state.pokeapi.fetchLocations();
                PrintMapData(data, state.pokeapi.pageNumber);
            }
        },
        mapb: {
            description: "Display a list of locations, going backwards",
            callback: async (state: State) => {
                if (!state.pokeapi.CanGoBack()) {
                    console.log("You're on the first page. Can't go any further back.");
                    return;
                }
                
                let data = await state.pokeapi.fetchLocations(true);
                PrintMapData(data, state.pokeapi.pageNumber);
            }
        },
        explore: {
            description: "Explore an area, given as the 2nd argument",
            callback: async (state: State, ...args: string[]) => {
                //console.log(args);
                // for now, assuming we always call the first entry in our map list (array index 0)
                let locationName:string = "pastoria-city-area"; //state.pokeapi.GetLocationStringAtIndex(0);
                if (args[0] != undefined)
                    locationName = args[0];

                console.log(`Exploring ${locationName}...`);
                let encounters:LocationEncounters = await state.pokeapi.GetEncountersFromLocationName(locationName);
                //console.log(encounters);
                let i:number = 0;
                for (const encounter of encounters.pokemon_encounters){
                    console.log(`[${i.toString().padStart(1 + ((encounters.pokemon_encounters.length-1)/10), ' ')}] - ${encounter.pokemon.name}`);
                    i++;
                }
            }
        }
    };
}

function PrintMapData(data: LocationData, pageNumber: number) {
    let results = data.results;
    console.log(`=== MAP DATA: [${pageNumber.toString().padStart(3, '0')}] ===`);
    for (let i in results) {
        console.log(results[i].name);
    }
    console.log("=======================");
}