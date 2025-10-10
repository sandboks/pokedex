import { Cache } from "./pokecache.js";

export class PokeAPI {
    private static readonly baseURL = "https://pokeapi.co/api/v2";
    private static readonly numberResults = 5;

    private static nextLocationsURL: string = "";
    private static prevLocationsURL: string = "";
    static pageNumber: number = 0;

    private cache = new Cache(10000);

    constructor() {}

    CanGoBack() {
        return (PokeAPI.prevLocationsURL != null) && PokeAPI.prevLocationsURL != "";
    }

    async fetchLocations(goBackwards:boolean = false) {
        let url = this.generateUrl(goBackwards);
        PokeAPI.pageNumber += (goBackwards ? -1 : 1);
        
        return await this.fetchLocationsInternal(url);
    }

    generateUrl(goBackwards:boolean = false): string {
        let url = (goBackwards ? PokeAPI.prevLocationsURL : PokeAPI.nextLocationsURL);
        if (PokeAPI.nextLocationsURL == "") {
            url = `${PokeAPI.baseURL}/location/?offset=0&limit=${PokeAPI.numberResults}`;
        }
        return url;
    }

    async fetchLocationsInternal(url: string): Promise<ShallowLocations> {
        let result:ShallowLocations;
        
        let cached = this.cache.get(url);
        if (cached != null) {
            result = cached.val;
        }
        else {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            result = await response.json();
            this.cache.add(url, result);
        }

        //console.log(result);
        PokeAPI.nextLocationsURL = result.next;
        PokeAPI.prevLocationsURL = result.previous;
        //console.log(PokeAPI.nextLocationsURL);
        //console.log(PokeAPI.prevLocationsURL);
        
        return result;
    }

    async fetchLocation(locationName: string): Promise<Location> {
        // implement this
        return {};
    }
}

export type ShallowLocations = {
    count: number,
    next: string,
    previous: string,
    results: {
        name: string,
        url: string,
    }[],
};

export type Location = {
    // add properties here
};