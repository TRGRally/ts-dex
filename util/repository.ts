enum BaseURL {
    PokedexAPI = 'https://pokemon-go-api.github.io/pokemon-go-api/api',
}

enum sortBy {
    Name = "name",
    DexNr = "dexNr"
}

enum sortDir {
    Asc = "asc",
    Desc = "desc"
}

const pokemonData = await fetchPokemonJson(); 
const regionForms = extractRegionForms(pokemonData);
const allPokemonData = pokemonData.concat(regionForms);
const allPokemonArray = getPokemonArray(allPokemonData);

//map of all pokemon by formid -> pokemon
//nidoran male and female have the same formid but belonging to a different pokemon id. 
//this is the only non-unique formid across all pokemon ids.
//basically formid == uniqueid if you ignore nidoran. its irrelevant anyway.

export const allPokemonMap = new Map<string, Pokemon>();

allPokemonArray.forEach((pokemon) => {
    allPokemonMap.set(pokemon.formId, pokemon);
});


export async function get(apiUrl: string): Promise<any> {

    const fullUrl = `${BaseURL.PokedexAPI}/${apiUrl}`;

    console.log('Fetching:', fullUrl);

    try {
        const response = await fetch(fullUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

async function fetchPokemonJson(): Promise<PokemonJson[]> {
    let data = await get("pokedex.json");
    return data;
}

function extractRegionForms(pokemonJsonArray: PokemonJson[]): PokemonJson[] {
    
    const regionForms = new Set<PokemonJson>();

    pokemonJsonArray.forEach((pokemonJson) => {
        Object.entries(pokemonJson.regionForms).forEach((regionForm) => {
            regionForms.add(regionForm[1]);
        });
    });

    const regionFormsArray = Array.from(regionForms);

    return regionFormsArray;
}


function getPokemonArray(pokemonJsonArray: PokemonJson[]): Pokemon[] {

    function convertPokemonJsonToPokemon(pokemonJson: PokemonJson): Pokemon {
        const id = pokemonJson.id;
        const formId = pokemonJson.formId;
        const name = pokemonJson.names.English;
        const dexNr = pokemonJson.dexNr;
        const type1 = pokemonJson.primaryType.type;
        const type2 = pokemonJson.secondaryType?.type;
        const generation = pokemonJson.generation;
        const imageUrl = pokemonJson.assets?.image;
        const shinyImageUrl = pokemonJson.assets?.shinyImage || null;
        const stats = pokemonJson.stats;
        const pokemonClass = pokemonJson.pokemonClass || null;
        const regionForms = Object.keys(pokemonJson.regionForms);
        const evolutions = Object.values(pokemonJson.evolutions).map((evolutionJson) => {
            return {
                id: evolutionJson.id,
                formId: evolutionJson.formId,
                candies: evolutionJson.candies,
                item: evolutionJson.item,
                quests: evolutionJson.quests.map((questJson) => {
                    return {
                        id: questJson.id,
                        name: questJson.names.English,
                        type: questJson.type
                    };
                })
            };
        });
        const megaEvolutions = Object.values(pokemonJson.megaEvolutions).map((megaEvolutionJson) => {
            return {
                id: megaEvolutionJson.id,
                name: megaEvolutionJson.names.English,
                imageUrl: megaEvolutionJson.assets.image,
                shinyImageUrl: megaEvolutionJson.assets.shinyImage || null,
                stats: megaEvolutionJson.stats,
                type1: megaEvolutionJson.primaryType.type,
                type2: megaEvolutionJson.secondaryType?.type || null
            };
        });
        
        let allQuickMoves = new Set<PokemonMove>();
        let allChargedMoves = new Set<PokemonMove>();

        function moveJsonToMove(moveJson: MoveJson, isLegacy: boolean): PokemonMove {
            const id = moveJson.id;
            const name = moveJson.names.English;
            const type = moveJson.type.type;

            const gym = {
                power: moveJson.combat.power,
                energy: moveJson.combat.energy,
                durationMs: moveJson.durationMs
            };

            const combat = {
                energy: moveJson.combat.energy,
                power: moveJson.combat.power,
                turns: moveJson.combat.turns,
                buffs: moveJson.combat.buffs || null
            };

            const moveObject = {
                id: id,
                name: name,
                type: type,
                isLegacy: isLegacy,
                gym: gym,
                combat: combat
            } as PokemonMove;

            return moveObject;
        }

        Object.entries(pokemonJson.eliteQuickMoves).forEach((move) => {
            const isLegacy = true;
            const moveJson = move[1];
            const moveObject = moveJsonToMove(moveJson, isLegacy);
            allQuickMoves.add(moveObject);
        });
        Object.entries(pokemonJson.quickMoves).forEach((move) => {
            const isLegacy = false;
            const moveJson = move[1];
            const moveObject = moveJsonToMove(moveJson, isLegacy);
            allQuickMoves.add(moveObject);
        });
        Object.entries(pokemonJson.eliteCinematicMoves).forEach((move) => {
            const isLegacy = true;
            const moveJson = move[1];
            const moveObject = moveJsonToMove(moveJson, isLegacy);
            allChargedMoves.add(moveObject);
        });
        Object.entries(pokemonJson.cinematicMoves).forEach((move) => {
            const isLegacy = false;
            const moveJson = move[1];
            const moveObject = moveJsonToMove(moveJson, isLegacy);
            allChargedMoves.add(moveObject);
        });

        const quickMoves = Array.from(allQuickMoves);
        const chargedMoves = Array.from(allChargedMoves);

        const pokemon = {
            id: id,
            formId: formId,
            name: name,
            dexNr: dexNr,
            type1: type1,
            type2: type2,
            generation: generation,
            imageUrl: imageUrl,
            shinyImageUrl: shinyImageUrl,
            stats: stats,
            quickMoves: quickMoves,
            chargedMoves: chargedMoves,
            pokemonClass: pokemonClass,
            regionForms: regionForms,
            evolutions: evolutions,
            megaEvolutions: megaEvolutions
        } as Pokemon;

        return pokemon;

    }

    const pokemonArray = pokemonJsonArray.map((pokemonJson) => {
        return convertPokemonJsonToPokemon(pokemonJson);
    });

    return pokemonArray;
}



const indexedDB = window.indexedDB;

export function initDB(allPokemonMap: Map<string, Pokemon>): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('pokedex', 3);

        request.onerror = (event) => {
            console.error('Database error:', event);
            reject(event);
        };

        request.onupgradeneeded = (event) => {
            const db = request.result;
            if (db.objectStoreNames.contains('pokemon')) {
                db.deleteObjectStore('pokemon');
            }
            const store = db.createObjectStore('pokemon', { keyPath: 'formId' });
            store.createIndex("id", "id", { unique: false });
            store.createIndex("name", "name", { unique: false });
            store.createIndex("type1", "type1", { unique: false });
            store.createIndex("type2", "type2", { unique: false });
            store.createIndex("generation", "generation", { unique: false });
            store.createIndex("dexNr", "dexNr", { unique: false });
        };

        request.onsuccess = (event) => {
            const db = request.result;
            const transaction = db.transaction('pokemon', 'readwrite');
            const store = transaction.objectStore('pokemon');

            const allPokemonArray = Array.from(allPokemonMap.values());
            allPokemonArray.forEach((pokemon) => {
                store.put(pokemon);
            });

            transaction.onerror = (event) => {
                console.error('Transaction error:', event);
                reject(event);
            };

            transaction.oncomplete = (event) => {
                db.close();
                resolve();
            };
        };
    });
}

//private to ensure access through repository only
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('pokedex', 3);

        request.onerror = (event) => {
            console.error('Database error:', event);
            reject(event);
        };

        request.onsuccess = (event) => {
            resolve(request.result);
        };
    });
}

export function getAllPokemon(): Promise<Pokemon[]> {
    return new Promise((resolve, reject) => {
        openDB().then((db) => {
            const transaction = db.transaction('pokemon', 'readonly');
            const store = transaction.objectStore('pokemon');
            const request = store.getAll();

            request.onerror = (event) => {
                console.error('Request error:', event);
                reject(event);
            };

            request.onsuccess = (event) => {
                console.log('Request time:', event.timeStamp);
                resolve(request.result);
            };
        });
    });
}

//prioritises matches that start with the query, then contains
export function searchPokemonByName(rawQuery: string): Promise<Pokemon[]> {
    return new Promise((resolve, reject) => {

        const startTime = performance.now();

        openDB().then((db) => {
            const transaction = db.transaction('pokemon', 'readonly');
            const store = transaction.objectStore('pokemon');
            const index = store.index('name');
            const query = rawQuery.toLowerCase();

            transaction.onerror = (event) => {
                console.error('Transaction error:', event);
                reject(event);
            };

            const matchedPokemon: { pokemon: Pokemon, rank: number }[] = [];

            index.openCursor().onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor) {
                    const pokemon: Pokemon = cursor.value;
                    const nameLowerCase = pokemon.name.toLowerCase();
                    const indexOfQuery = nameLowerCase.indexOf(query);

                    if (indexOfQuery !== -1) {
                        matchedPokemon.push({ pokemon, rank: indexOfQuery });
                    }

                    cursor.continue();
                } else {

                    matchedPokemon.sort((a, b) => a.rank - b.rank);
                    const sortedPokemon = matchedPokemon.map(entry => entry.pokemon);

                    const endTime = performance.now();
                    const queryDuration = endTime - startTime;

                    console.log("Request time:", queryDuration)

                    resolve(sortedPokemon);
                }
            };

        }).catch((error) => {
            reject(error);
        });
    });
}
