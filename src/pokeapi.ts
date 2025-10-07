export class PokeAPI {
    private static readonly baseURL = "https://pokeapi.co/api/v2";
    private static readonly numberResults = 5;

    private static nextLocationsURL: string = "";
    private static prevLocationsURL: string = "";

    constructor() {}

    CanGoBack() {
        return (PokeAPI.prevLocationsURL != null) && PokeAPI.prevLocationsURL != "";
    }

    async fetchLocations(goBackwards?:boolean, pageURL?: string): Promise<ShallowLocations> {
        //https://pokeapi.co/api/v2/location-area/?offset=0&limit=5
        //let url = pageURL ? pageURL : `${PokeAPI.baseURL}/location/?offset=0&limit=5`;
        let url = (PokeAPI.nextLocationsURL == "") ? `${PokeAPI.baseURL}/location/?offset=0&limit=${PokeAPI.numberResults}` : (goBackwards ? PokeAPI.prevLocationsURL : PokeAPI.nextLocationsURL);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result: ShallowLocations = await response.json();
        //console.log(result);
        PokeAPI.nextLocationsURL = result.next;
        PokeAPI.prevLocationsURL = result.previous;
        console.log(PokeAPI.nextLocationsURL);
        console.log(PokeAPI.prevLocationsURL);
        
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