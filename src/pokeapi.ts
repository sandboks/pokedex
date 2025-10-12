import { Cache } from "./pokecache.js";

export class PokeAPI {
    private static readonly baseURL = "https://pokeapi.co/api/v2";
    private numberResults = 5;

    private static nextLocationsURL: string = "";
    private static prevLocationsURL: string = "";
    private currentURL: string = "";
    pageNumber: number = 0;

    private cache = new Cache(10000);
    private queuedData?: any;
    pokedex = new Cache();


    constructor() {}

    SetNumberResults(n:number) {
        this.numberResults = n;
    }

    CanGoBack() {
        return (this.pageNumber > 1);
        //return (PokeAPI.prevLocationsURL != null) && PokeAPI.prevLocationsURL != "";
    }

    // the public function that gets called. We either go forwards or backwards, and handle the urls here in this class
    async fetchLocations(goBackwards:boolean = false) {
        let url = this.generateUrl(goBackwards);
        this.pageNumber += (goBackwards ? -1 : 1);
        
        return await this.fetchRegionsInternal(url);
    }

    generateUrl(goBackwards:boolean = false): string {
        let url = (goBackwards ? PokeAPI.prevLocationsURL : PokeAPI.nextLocationsURL);
        if (PokeAPI.nextLocationsURL == "") {
            url = `${PokeAPI.baseURL}/location/?offset=0&limit=${this.numberResults}`;
        }
        return url;
    }

    async FetchDataFromURL<T>(url: string): Promise<T | null> {
        let cached = this.cache.get(url);
        if (cached != null) {
            return cached.val as T;
        }

        const result = await this.GetDataFromNetwork<T>(url);
        if (result !== null) {
            this.cache.add(url, result);
        }
        return result; // may be null
    }

    async GetDataFromNetwork<T>(url: string): Promise<T | null> { //T | null
        if (this.queuedData != null) {
            let data: T = this.queuedData;
            this.queuedData = undefined;
            return data;
        }
        
        const response = await fetch(url);
            if (!response.ok) {
                //throw new Error(`Response status: ${response.status}`);
                return null;
            }

        let result:T = await response.json();
        return result;
    }

    private async fetchRegionsInternal(url: string): Promise<RegionData | null> {
        let result = await this.FetchDataFromURL<RegionData>(url);
        if (result == null)
            return null;
        
        PokeAPI.nextLocationsURL = result.next;
        PokeAPI.prevLocationsURL = result.previous;
        this.currentURL = url;

        return result;
    }

    async GetEncountersFromLocationName(locationName: string): Promise<LocationEncounters | null> {
        let url:string = PokeAPI.baseURL + `/location-area/` + locationName;
        return await this.FetchDataFromURL<LocationEncounters>(url);
    }

    async GetPokemonDataFromNetwork(pokemonName: string): Promise<PokemonData | null> {
        //https://pokeapi.co/api/v2/pokemon/pikachu
        let url:string = PokeAPI.baseURL + `/pokemon/` + pokemonName;
        return await this.FetchDataFromURL<PokemonData>(url);
    }

    async RollForCapture(data: PokemonData): Promise<boolean> {
        let speciesData = await this.FetchDataFromURL<PokemonSpeciesData>(data.species.url);
        if (speciesData == null)
            return false;
        let catchRate = speciesData.capture_rate;
        console.log(catchRate);
        let random = Math.floor(Math.random() * (255 + 1));
        console.log(random);
        let caughtSuccessfully:boolean = (random < catchRate);
        if (caughtSuccessfully) {
            this.pokedex.add(data.name, data);
        }
        return caughtSuccessfully;
    }

    async GetLocationDataFromUrl(url: string): Promise<RegionData | null> {
        return this.GetDataFromNetwork<RegionData>(url);
    }

    QueueJsonData(data: any) {
        this.queuedData = data;
    }

    GetLocationStringAtIndex(n: number): string {
        let cached = this.cache.get(this.currentURL);
        if (cached != null) {
            let data:RegionData = cached.val;
            //console.log("ERROR: Location not found");
            return data.results[n].name;
        }
        else {
            return "";
        }
        //let data:ShallowLocations = cached.val;
    }
}

// RegionData: a broader "region" that contains several "location"s. Each "location" has "encounters".
export type RegionData = { // = null |
    count: number,
    next: string,
    previous: any,
    results: {
        name: string,
        url: string,
    }[],
};

export type LocationEncounters = {
    encounter_method_rates: {
        encounter_method: {
            name: string
            url: string
        }
        version_details: {
            rate: number
            version: {
                name: string
                url: string
            }
        }[]
    }[]
    game_index: number
    id: number
    location: {
        name: string
        url: string
    }
    name: string
    names: {
        language: {
            name: string
            url: string
        }
        name: string
    }[],
    pokemon_encounters: {
        pokemon: {
            name: string
            url: string
        }
        version_details: {
            encounter_details: {
                chance: number
                condition_values: any[]
                max_level: number
                method: {
                    name: string
                    url: string
                }
                min_level: number
            }[]
            max_chance: number
            version: {
                name: string
                url: string
            }
        }[]
    }[]
};

export type PokemonData = {
    abilities: {
        ability: {
            name: string
            url: string
        }
        is_hidden: boolean
        slot: number
    }[]
    base_experience: number
    //cries: Cries
    //forms: Form[]
    //game_indices: Index[]
    height: number
    //held_items: HeldItem[]
    id: number
    is_default: boolean
    location_area_encounters: string
    //moves: Mfe[]
    name: string
    order: number
    //past_abilities: PastAbility[]
    past_types: any[]
    species: {
        name: string
        url: string
    }
    //sprites: Sprites
    stats: {
        base_stat: number
        effort: number
        stat: {
            name: string
            url: string
        }
    }[]
    types: {
        slot: number
        type: {
            name: string
            url: string
        }
    }[]
    weight: number
};

type PokemonSpeciesData = {
    base_happiness: number
    capture_rate: number
    //color: Color
    //egg_groups: EggGroup[]
    //evolution_chain: EvolutionChain
    //evolves_from_species: EvolvesFromSpecies
    //flavor_text_entries: FlavorTextEntry[]
    form_descriptions: any[]
    forms_switchable: boolean
    gender_rate: number
    //genera: Genera[]
    //generation: Generation
    //growth_rate: GrowthRate
    //habitat: Habitat
    has_gender_differences: boolean
    hatch_counter: number
    id: number
    is_baby: boolean
    is_legendary: boolean
    is_mythical: boolean
    name: string
    //names: Name[]
    order: number
    //pal_park_encounters: PalParkEncounter[]
    //pokedex_numbers: PokedexNumber[]
    //shape: Shape
    //varieties: Variety[]
}