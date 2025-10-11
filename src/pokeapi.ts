import { Cache } from "./pokecache.js";

export class PokeAPI {
    private static readonly baseURL = "https://pokeapi.co/api/v2";
    private numberResults = 5;

    private static nextLocationsURL: string = "";
    private static prevLocationsURL: string = "";
    pageNumber: number = 0;

    private cache = new Cache(10000);
    private queuedData?: ShallowLocations;

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

    private async fetchLocationsInternal(url: string): Promise<ShallowLocations> {
        let result:ShallowLocations;
        
        let cached = this.cache.get(url);
        if (cached != null) {
            result = cached.val;
        }
        else {
            result = await this.GetResponseFromUrl(url);
            this.cache.add(url, result);
        }

        PokeAPI.nextLocationsURL = result.next;
        PokeAPI.prevLocationsURL = result.previous;
        //console.log(PokeAPI.nextLocationsURL);
        //console.log(PokeAPI.prevLocationsURL);
        
        return result;
    }

    async GetResponseFromUrl(url: string): Promise<ShallowLocations> {
        if (this.queuedData != null) {
            let data: ShallowLocations = this.queuedData;
            this.queuedData = undefined;
            return data;
        }
        
        const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

        let result:ShallowLocations = await response.json();
        return result;
    }

    QueueJsonData(data: ShallowLocations) {
        this.queuedData = data;
    }

    async fetchLocation(locationName: string): Promise<Location> {
        // implement this
        return {};
    }
}

export type ShallowLocations = {
    count: number,
    next: string,
    previous: any,
    results: {
        name: string,
        url: string,
    }[],
};

export type Location = {
    // add properties here
};