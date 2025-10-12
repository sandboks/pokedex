

export type CacheEntry<T> = {
    createdAt: number,
    val: T,
}

//Create an add<T>() method that adds a new entry to the cache object. It should take a key (a string) and a val (a T generic).
//Create a get<T>() method that gets an entry from the cache object. It should take a key (a string) and returns some object. Return undefined if the entry is missing.

/*
Create a #reap() method to delete any entries that are older than the interval. It should loop through the cache and delete any entries that are older than Date.now() - this.#interval.
Create a #startReapLoop() method that uses setInterval() to call this.#reap() after a delay of this.#interval and store the interval ID in this.#reapIntervalID.
Pass a number parameter to the constructor() method and assign its value to this.#interval. Call this.#startReapLoop() in the constructor() method to get the loop started.
Create a public (non-#) stopReapLoop() method that uses clearInterval() to stop the reap loop and set this.#reapIntervalID back to undefined.
*/

export class Cache {
    #cache = new Map<string, CacheEntry<any>>();
    #reapIntervalId: NodeJS.Timeout | undefined = undefined;
    #interval: number; //ms

    constructor(n:number = -1) {
        this.#interval = n;
        if (n != -1)
            this.#startReapLoop();
    }

    add<T>(key:string, val:T) {
        let c: CacheEntry<T> = {
            createdAt: Date.now(),
            val: val,
        }
        this.#cache.set(key, c);
    }

    get<T>(key:string) {
        return this.#cache.get(key);
    }

    #reap(): void {
		for (let [key, value] of this.#cache) {
        //for (let [key, value] of this.#cache) {
            if (Date.now() - value.createdAt > this.#interval) {
                this.#cache.delete(key);
                console.log("DELET");
            }
            //console.log(this.#cache.entries());
            //console.log(key + " / " + value);
        }
    }

    #startReapLoop() {
        this.#reapIntervalId = setInterval(() => this.#reap(), this.#interval);
        //this.#reapIntervalId = setInterval(this.#reap, this.#interval);
    }

    stopReapLoop() {
        clearInterval(this.#reapIntervalId);
        this.#reapIntervalId = undefined;
    }
}