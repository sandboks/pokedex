
import { describe, expect, test } from "vitest";
//import { initState } from "./state.js";
//import type { State } from "./state.js";
import { PokeAPI, RegionData, LocationEncounters } from "./pokeapi.js";

describe("PokeAPI / location / cache testing", () => {
    describe("test nothing", () => {
        test("test nothing", () => {
            expect(Math.sqrt(4)).toBe(2)
            //expect(Math.sqrt(4)).toBe(3)
        })
    });
    

    let pokeAPI = new PokeAPI();
    pokeAPI.SetNumberResults(5);

    test("initial state tests", async () => {
        // Assertions
        expect(pokeAPI.CanGoBack()).toBe(false)
        expect(pokeAPI.pageNumber).toBe(0);
    });

    test("offline hardcoded data", async () => {
        let data:RegionData = {"count":1070,"next":"https://pokeapi.co/api/v2/location/?offset=5&limit=5","previous":null,"results":[{"name":"canalave-city","url":"https://pokeapi.co/api/v2/location/1/"},{"name":"eterna-city","url":"https://pokeapi.co/api/v2/location/2/"},{"name":"pastoria-city","url":"https://pokeapi.co/api/v2/location/3/"},{"name":"sunyshore-city","url":"https://pokeapi.co/api/v2/location/4/"},{"name":"sinnoh-pokemon-league","url":"https://pokeapi.co/api/v2/location/5/"}]};
        pokeAPI.QueueJsonData(data);
        pokeAPI.fetchLocations();

        // Assertions
        expect(pokeAPI.CanGoBack()).toBe(false)
        expect(pokeAPI.pageNumber).toBe(1);

        data = {"count":1070,"next":"https://pokeapi.co/api/v2/location/?offset=10&limit=5","previous":"https://pokeapi.co/api/v2/location/?offset=0&limit=5","results":[{"name":"oreburgh-mine","url":"https://pokeapi.co/api/v2/location/6/"},{"name":"valley-windworks","url":"https://pokeapi.co/api/v2/location/7/"},{"name":"eterna-forest","url":"https://pokeapi.co/api/v2/location/8/"},{"name":"fuego-ironworks","url":"https://pokeapi.co/api/v2/location/9/"},{"name":"mt-coronet","url":"https://pokeapi.co/api/v2/location/10/"}]};
        pokeAPI.QueueJsonData(data);
        pokeAPI.fetchLocations();

        // Assertions
        expect(pokeAPI.CanGoBack()).toBe(true)
        expect(pokeAPI.pageNumber).toBe(2);

        pokeAPI.fetchLocations(true);
        // Assertions
        expect(pokeAPI.CanGoBack()).toBe(false)
        expect(pokeAPI.pageNumber).toBe(1);
    })

})

describe("PokeAPI / encounters ", () => {
    let pokeAPI = new PokeAPI();
    
    test("load encounters", async () => {
        let locationName:string = "pastoria-city-area";
        let encounters:LocationEncounters | null = await pokeAPI.GetEncountersFromLocationName(locationName);

        if (encounters == null)
            return;

        // assertions
        expect(encounters.pokemon_encounters.length).toBe(10);

        locationName = "valley-windworks-area";
        encounters = await pokeAPI.GetEncountersFromLocationName(locationName);
        if (encounters == null)
            return;
        
        expect(encounters.pokemon_encounters.length).toBe(19);
    });
})

describe("PokeAPI / online network functionality", () => {
    let pokeAPI = new PokeAPI();
    
    test("basic network functionality", async () => {
        await pokeAPI.fetchLocations();
        expect(pokeAPI.CanGoBack()).toBe(false)
        expect(pokeAPI.pageNumber).toBe(1);

        await pokeAPI.fetchLocations();
        expect(pokeAPI.CanGoBack()).toBe(true)
        expect(pokeAPI.pageNumber).toBe(2);

        await pokeAPI.fetchLocations();
        expect(pokeAPI.CanGoBack()).toBe(true)
        expect(pokeAPI.pageNumber).toBe(3);

        await pokeAPI.fetchLocations(true);
        expect(pokeAPI.CanGoBack()).toBe(true)
        expect(pokeAPI.pageNumber).toBe(2);

        await pokeAPI.fetchLocations(true);
        expect(pokeAPI.CanGoBack()).toBe(false)
        expect(pokeAPI.pageNumber).toBe(1);
    });
})