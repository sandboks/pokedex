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
        
        return await this.fetchLocationsInternal(url);
    }

    generateUrl(goBackwards:boolean = false): string {
        let url = (goBackwards ? PokeAPI.prevLocationsURL : PokeAPI.nextLocationsURL);
        if (PokeAPI.nextLocationsURL == "") {
            url = `${PokeAPI.baseURL}/location/?offset=0&limit=${this.numberResults}`;
        }
        return url;
    }

    private async fetchLocationsInternal(url: string): Promise<LocationData> {
        let result:LocationData;
        
        let cached = this.cache.get(url);
        if (cached != null) {
            result = cached.val;
        }
        else {
            result = await this.GetLocationDataFromUrl(url);
            this.cache.add(url, result);
        }

        PokeAPI.nextLocationsURL = result.next;
        PokeAPI.prevLocationsURL = result.previous;
        this.currentURL = url;
        //console.log(PokeAPI.nextLocationsURL);
        //console.log(PokeAPI.prevLocationsURL);
        
        return result;
    }

    async GetLocationDataFromUrl(url: string): Promise<LocationData> {
        return this.GetDataFromUrl<LocationData>(url);
    }

    async GetDataFromUrl<T>(url: string): Promise<T> {
        if (this.queuedData != null) {
            let data: T = this.queuedData;
            this.queuedData = undefined;
            return data;
        }
        
        const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

        let result:T = await response.json();
        return result;
    }

    QueueJsonData(data: any) {
        this.queuedData = data;
    }

    GetLocationStringAtIndex(n: number): string {
        let cached = this.cache.get(this.currentURL);
        if (cached != null) {
            let data:LocationData = cached.val;
            //console.log("ERROR: Location not found");
            return data.results[n].name;
        }
        else {
            return "";
        }
        //let data:ShallowLocations = cached.val;
    }

    async GetEncountersFromLocationName(locationName: string): Promise<LocationEncounters> {
        let result:LocationEncounters;

        //https://pokeapi.co/api/v2/location-area/canalave-city-area/
        let url:string = PokeAPI.baseURL + `/location-area/` + locationName;
        console.log(url);
        
        let cached = this.cache.get(url);
        if (cached != null) {
            result = cached.val;
        }
        else {
            result = await this.GetDataFromUrl<LocationEncounters>(url);
            this.cache.add(url, result);
        }

        return result;
    }
}

export type LocationData = {
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