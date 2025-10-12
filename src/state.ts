import { createInterface, type Interface } from "readline";
import { PokeAPI, RegionData, LocationEncounters, PokemonData } from "./pokeapi.js";

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
                if (data == null) {
                    console.log("ERROR: unable to fetch data");
                    return;
                }
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
                
                let data: RegionData | null = await state.pokeapi.fetchLocations(true);
                if (data == null) {
                    console.log("ERROR: unable to fetch data");
                    return;
                }
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

                let encounters:LocationEncounters | null = await state.pokeapi.GetEncountersFromLocationName(locationName);
                if (encounters == null) {
                    console.log(`ERROR: Location "${locationName}" not found`);
                    return;
                }
                console.log(`Exploring ${locationName}...`);
                //console.log(encounters);
                let i:number = 0;
                for (const encounter of encounters.pokemon_encounters){
                    console.log(`[${i.toString().padStart(1 + ((encounters.pokemon_encounters.length-1)/10), ' ')}] - ${encounter.pokemon.name}`);
                    i++;
                }
            }
        },
        catch: {
            description: "Catch a Pokemon, given as the 2nd argument",
            callback: async (state: State, ...args: string[]) => {
                let pokemonName:string = "pikachu";
                if (args[0] != undefined)
                    pokemonName = args[0];
                if (state.pokeapi.pokedex.get(pokemonName) != null) {
                    console.log(`Already caught ${pokemonName}...`)
                    return;
                }
                
                let data:PokemonData | null = await state.pokeapi.GetPokemonDataFromNetwork(pokemonName);
                if (data == null) {
                    console.log(`ERROR: Pokemon "${pokemonName}" not found`);
                    return;
                }
                console.log(`Throwing ball at ${pokemonName}...`);

                let successfulCatch:boolean = await state.pokeapi.RollForCapture(data);
                console.log(successfulCatch ? `Successfully captured ${pokemonName}!` : `${pokemonName} got away...`);
            }
        },
        pokedex: {
            description: "List all Pokemon caught and added to the Pokedex",
            callback: async (state: State) => {
                //console.log(state.pokeapi.pokedex.GetAllKeys());
                let PokedexEntries = state.pokeapi.pokedex.GetAllKeys();
                console.log(`=== POKEDEX ENTRIES: [${PokedexEntries.length.toString().padStart(3, '0')}] ===`);
                for (let i = 0; i < PokedexEntries.length; i++) {
                    console.log(`- ${PokedexEntries[i]}`);
                }
                console.log("==============================");
            }
        },
        inspect: {
            description: "Check data of a caught Pokemon, given as the 2nd argument",
            callback: async (state: State, ...args: string[]) => {
                if (args.length == 0) {
                    console.log("ERROR: no pokemon name provided");
                    return;
                }
                let p:string = args[0];
                let data = state.pokeapi.pokedex.get(p);
                if (data == null) {
                    console.log(`You haven't caught a ${p} yet!`);
                }
                else {
                    let pokemon:PokemonData = state.pokeapi.pokedex.get(p)?.val;
                    
                    let statsLine:string[] = [];
                    for (let i = 0; i < pokemon.stats.length; i++) {
                       statsLine.push(`-- ${pokemon.stats[i].stat.name}: ${pokemon.stats[i].base_stat}`);
                    }
                    let printouts:string[] = [
                        `Name: ${p}`,
                        `Type: [${pokemon.types[0].type.name}] ${pokemon.types.length == 1 ? "" : `/ [${pokemon.types[1].type.name}]`}`,
                        `Height: ${(pokemon.height * 0.1).toFixed(1)}m`,
                        `Weight: ${(pokemon.weight * 0.1).toFixed(1)}kg`,
                        `BST:`,
                        `${statsLine.join(`\n`)}`,
                    ];
                    console.log(printouts.join(`\n`));
                }
            }
        },
    };
}

function PrintMapData(data: RegionData, pageNumber: number) {
    let results = data.results;
    console.log(`=== MAP DATA: [${pageNumber.toString().padStart(3, '0')}] ===`);
    for (let i in results) {
        console.log(results[i].name);
    }
    console.log("=======================");
}