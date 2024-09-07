enum BaseURL {
    PokedexAPI = 'https://pokemon-go-api.github.io/pokemon-go-api/api',
    PokeMiners = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master',
    PokeBattler = 'https://fight.pokebattler.com'
}

enum sortBy {
    Name = "name",
    DexNr = "dexNr"
}

enum sortDir {
    Asc = "asc",
    Desc = "desc"
}

export enum Region {
    Kanto = "KANTO",
    Johto = "JOHTO",
    Hoenn = "HOENN",
    Sinnoh = "SINNOH",
    Unova = "UNOVA",
    Kalos = "KALOS",
    Alola = "ALOLA",
    Galar = "GALARIAN",
    Paldea = "PALDEA",
}


export async function getJson(apiUrl: string, baseUrl: BaseURL = BaseURL.PokedexAPI): Promise<any> {

    const fullUrl = `${baseUrl}/${apiUrl}`;

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

export function getTypeIcon(type: string): string {

    if (!type.includes('_')) {
        type = `POKEMON_TYPE_${type.toUpperCase()}`;
    }

    return `${BaseURL.PokeMiners}/Images/Types/${type}.png`;
}

export function getWeatherIcon(assetName: string): string {
    return `${BaseURL.PokeMiners}/Images/Weather/${assetName}.png`;
}

async function fetchCurrentRaidsJson(): Promise<BreakingNewsJson[]> {
    const data = await getJson("/raids", BaseURL.PokeBattler);
    console.log('raids:', data.breakingNews);
    return data.breakingNews;
}

async function fetchPokemonJson(): Promise<PokemonJson[]> {
    let data = await getJson("pokedex.json");
    return data;
}

async function fetchTypeJson(): Promise<TypeJson[]> {
    let data = await getJson("types.json");
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

function getTypesArray(typesJsonArray: TypeJson[]): Type[] {
    
        function convertTypeJsonToType(typeJson: TypeJson): Type {
            const type = typeJson.type;
            const name = typeJson.names.English;
            const imageUrl = getTypeIcon(type);
            const doubleDamageFrom = typeJson.doubleDamageFrom;
            const halfDamageFrom = typeJson.halfDamageFrom;
            const noDamageFrom = typeJson.noDamageFrom;
            const weatherBoostJson = typeJson.weatherBoost;

            const weatherBoost = {
                id: weatherBoostJson.id,
                name: weatherBoostJson.names.English,
                imageUrl: getWeatherIcon(weatherBoostJson.id)
            } as WeatherBoost;
    
            const typeObject = {
                type: type,
                name: name,
                imageUrl: imageUrl,
                doubleDamageFrom: doubleDamageFrom,
                halfDamageFrom: halfDamageFrom,
                noDamageFrom: noDamageFrom,
                weatherBoost: weatherBoost
            } as Type;
    
            return typeObject;
        }
    
        const typesArray = typesJsonArray.map((typeJson) => {
            return convertTypeJsonToType(typeJson);
        });
    
        return typesArray;
    }

function getPokemonArray(pokemonJsonArray: PokemonJson[]): Pokemon[] {

    function PokemonImageUrlTo256x(imageUrl: string): string {
        return imageUrl.replace('/Images/Pokemon/', '/Images/Pokemon%20-%20256x256/');
    }

    function convertPokemonJsonToPokemon(pokemonJson: PokemonJson): Pokemon {
        const id = pokemonJson.id;
        const formId = pokemonJson.formId;
        const name = pokemonJson.names.English;
        const dexNr = pokemonJson.dexNr;
        const type1 = pokemonJson.primaryType.type;
        const type2 = pokemonJson.secondaryType?.type;
        const generation = pokemonJson.generation;
        const imageUrl = pokemonJson.assets?.image ? PokemonImageUrlTo256x(pokemonJson.assets.image) : undefined;
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

    //crazy id conversion (blame the api)
    pokemonArray.forEach((pokemon) => {
        pokemon.evolutions.forEach((evolution) => {
            if (evolution.formId.includes('_NORMAL')) {
                evolution.formId = evolution.formId.replace('_NORMAL', '');
            }
        });
    });

    //fix for nidoran male and female
    pokemonArray.forEach((pokemon) => {
        if (pokemon.id === "NIDORAN_MALE") {
            pokemon.formId = "NIDORAN_MALE";
        }
        if (pokemon.id === "NIDORAN_FEMALE") {
            pokemon.formId = "NIDORAN_FEMALE";
        }
    });
    


    //creates the symmetric transitive relationship between pokemon regional forms. each pokemon.regionForms should be an exhaustive list of all regional forms it has a relationship with.
    pokemonArray.forEach((pokemon) => {
        const regionFormId = pokemon.formId;
        const regionalForms = new Set<string>();

        //symmetric closure
        pokemonArray.forEach((potentialParent) => {
            if (potentialParent.regionForms.includes(regionFormId)) {
                regionalForms.add(potentialParent.formId);
                potentialParent.regionForms.forEach((formId) => {
                    regionalForms.add(formId);
                });
            }
        });

        //transitive closure
        regionalForms.forEach((formId) => {
            pokemonArray.forEach((potentialSibling) => {
                if (regionalForms.has(potentialSibling.formId) && potentialSibling.formId !== regionFormId) {
                    if (!pokemon.regionForms.includes(potentialSibling.formId)) {
                        pokemon.regionForms.push(potentialSibling.formId);
                    }
                    if (!potentialSibling.regionForms.includes(regionFormId)) {
                        potentialSibling.regionForms.push(regionFormId);
                    }
                }
            });
        });
    });

    console.log('pokemonArray:', pokemonArray);


    return pokemonArray;
}


export async function getRaids(): Promise<Raid[]> {

    const raidsJson = await fetchCurrentRaidsJson();

    const formIds = new Set<string>();
    raidsJson.forEach((raidJson) => {
        formIds.add(raidJson.pokemon);
    });

    const raidPokemon = await Promise.all(Array.from(formIds).map((formId) => {
        return getPokemonById(formId);
    }));

    const raids = raidsJson.map((raidJson) => {
        const pokemon = raidPokemon.find((pokemon) => pokemon.formId === raidJson.pokemon);
        if (!pokemon) {
            console.error(`Pokemon with formId ${raidJson.pokemon} not found in raidPokemon array.`);
            return null; // or handle this case as needed
        }
        return {
            pokemon: pokemon,
            shiny: raidJson.shiny,
            tier: raidJson.tier,
            startDate: raidJson.startDate,
            endDate: raidJson.endDate,
            activeDate: raidJson.activeDate
        } as Raid;
    }).filter(raid => raid !== null); // Filter out any null values
    
    return raids;

}



const indexedDB = window.indexedDB;

export async function initDB(): Promise<void> {
    localStorage.setItem('lastUpdate', new Date().toISOString());
    console.log('db refreshed');

    const typesData = await fetchTypeJson();
    const allTypesData = getTypesArray(typesData);

    //temporary costume exclusion while i work out how theyll be handled
    const costumeFormIds = ['PIKACHU_DOCTOR', 'PIKACHU_FLYING_01', 'PIKACHU_FLYING_02', 'PIKACHU_TSHIRT_01', 'PIKACHU_TSHIRT_02', 'PIKACHU_FLYING_03', 'PIKACHU_FLYING_04', 'PIKACHU_FLYING_5TH_ANNIV', 'PIKACHU_FLYING_OKINAWA', 'PIKACHU_GOFEST_2024_MTIARA', 'PIKACHU_GOFEST_2024_STIARA', 'PIKACHU_GOTOUR_2024_A', 'PIKACHU_GOTOUR_2024_A_02', 'PIKACHU_GOTOUR_2024_B', 'PIKACHU_GOTOUR_2024_B_02', 'PIKACHU_HORIZONS', 'PIKACHU_JEJU', 'PIKACHU_KARIYUSHI', 'PIKACHU_POP_STAR', 'PIKACHU_ROCK_STAR', 'PIKACHU_SUMMER_2023_A', 'PIKACHU_SUMMER_2023_B', 'PIKACHU_SUMMER_2023_C', 'PIKACHU_SUMMER_2023_D', 'PIKACHU_SUMMER_2023_E', 'PIKACHU_TSHIRT_03', 'EEVEE_GOFEST_2024_MTIARA', 'EEVEE_GOFEST_2024_STIARA', 'ESPEON_GOFEST_2024_SSCARF', 'UMBREON_GOFEST_2024_MSCARF'];

    const pokemonData = await fetchPokemonJson(); 
    const regionForms = extractRegionForms(pokemonData);
    const allPokemonData = pokemonData.concat(regionForms);
    const allPokemonArray = getPokemonArray(allPokemonData);

    //map of all pokemon by formid -> pokemon
    //nidoran male and female have the same formid but belonging to a different pokemon id. 
    //this is the only non-unique formid across all pokemon ids.
    //basically formid == uniqueid if you ignore nidoran. its irrelevant anyway.

    const allPokemonMap = new Map<string, Pokemon>();

    allPokemonArray.forEach((pokemon) => {

        //temp costume exclusion
        if (costumeFormIds.includes(pokemon.formId)) {
            return;
        }

        allPokemonMap.set(pokemon.formId, pokemon);
    });

    

    return new Promise((resolve, reject) => {
        const request = indexedDB.open('pokedex', 7);

        request.onerror = (event) => {
            console.error('Database error:', event);
            reject(event);
        };

        request.onupgradeneeded = (event) => {
            const db = request.result;

            if (db.objectStoreNames.contains('pokemon')) {
                db.deleteObjectStore('pokemon');
            }
            if (db.objectStoreNames.contains('types')) {
                db.deleteObjectStore('types');
            }

            const pokemonStore = db.createObjectStore('pokemon', { keyPath: 'formId' });
            pokemonStore.createIndex("id", "id", { unique: false });
            pokemonStore.createIndex("name", "name", { unique: false });
            pokemonStore.createIndex("type1", "type1", { unique: false });
            pokemonStore.createIndex("type2", "type2", { unique: false });
            pokemonStore.createIndex("generation", "generation", { unique: false });
            pokemonStore.createIndex("dexNr", "dexNr", { unique: false });

            const typeStore = db.createObjectStore('types', { keyPath: 'type' });
            typeStore.createIndex("name", "name", { unique: true });
            typeStore.createIndex("doubleDamageFrom", "doubleDamageFrom", { unique: false });
            typeStore.createIndex("halfDamageFrom", "halfDamageFrom", { unique: false });
            typeStore.createIndex("noDamageFrom", "noDamageFrom", { unique: false });
            typeStore.createIndex("weatherBoostName", "weatherBoost.name", { unique: false });


            //just refresh the page to get new data (lazy lol)
            pokemonStore.transaction.oncomplete = (event) => {
                location.reload();
            };


        };

        request.onsuccess = (event) => {
            const db = request.result;
            const transaction = db.transaction(['pokemon', 'types'], 'readwrite');
            const pokemonStore = transaction.objectStore('pokemon');
            const typeStore = transaction.objectStore('types');

            const allPokemonArray = Array.from(allPokemonMap.values());
            allPokemonArray.forEach((pokemon) => {
                pokemonStore.put(pokemon);
            });

            allTypesData.forEach((type) => {
                typeStore.put(type);
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
        const request = indexedDB.open("pokedex");

        request.onerror = (event) => {
            console.error('Database error:', event);
            reject(event);
        };

        request.onsuccess = (event) => {
            resolve(request.result);
        };
    });
}

export function getAllPokemon(page: number, pageSize: number): Promise<Pokemon[]> {
    return new Promise((resolve, reject) => {
        openDB().then((db) => {
            const transaction = db.transaction('pokemon', 'readonly');
            const pokemonStore = transaction.objectStore('pokemon');

            //whoops
            const dexNrIndex = pokemonStore.index('dexNr');

            const startIndex = (page - 1) * pageSize;
            const stopIndex = startIndex + pageSize;

            const request = dexNrIndex.openCursor();
            const paginatedPokemon: Pokemon[] = [];
            let currentIndex = 0;

            request.onerror = (event) => {
                console.error('Request error:', event);
                reject(event);
            };

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor) {
                    if (currentIndex >= startIndex && currentIndex < stopIndex) {
                        paginatedPokemon.push(cursor.value);
                    }

                    currentIndex++;

                    if (currentIndex < stopIndex) {
                        cursor.continue();
                    } else {
                        resolve(paginatedPokemon);
                    }
                } else {
                    resolve(paginatedPokemon);
                }
            };
        }).catch((error) => {
            reject(error);
        });
    });
}


export function getPokemonById(formId: string): Promise<Pokemon> {
    return new Promise((resolve, reject) => {
        openDB().then((db) => {
            const transaction = db.transaction('pokemon', 'readonly');
            const pokemonStore = transaction.objectStore('pokemon');

            const request = pokemonStore.get(formId);

            request.onerror = (event) => {
                console.error('Request error:', event);
                reject(event);
            };

            request.onsuccess = (event) => {
                resolve(request.result);
            };
        });
    });
}

export function getPokemonByRegion(region: Region, page: number, pageSize: number): Promise<Pokemon[]> {
    return new Promise((resolve, reject) => {
        openDB().then((db) => {
            const transaction = db.transaction('pokemon', 'readonly');
            const pokemonStore = transaction.objectStore('pokemon');

            const request = pokemonStore.getAll();

            request.onerror = (event) => {
                console.error('Request error:', event);
                reject(event);
            };

            request.onsuccess = (event) => {
                const allPokemon = request.result;
                const regionPokemon = allPokemon.filter((pokemon) => {
                    //form id has _REGIONNAME at the end
                    return pokemon.formId.endsWith(`_${region}`);
                });

                const startIndex = (page - 1) * pageSize;
                const stopIndex = startIndex + pageSize;

                const paginatedPokemon = regionPokemon.slice(startIndex, stopIndex);

                resolve(paginatedPokemon);
            };
        }).catch((error) => {
            reject(error);
        });
    });
}

//prioritises matches that start with the query, then contains at pos 0, 1, 2 ... etc.
export function searchPokemonByName(rawQuery: string, page: number, pageSize: number): Promise<Pokemon[]> {
    return new Promise(async (resolve, reject) => {

        const startTime = performance.now();

        openDB().then((db) => {
            const transaction = db.transaction('pokemon', 'readonly');
            const pokemonStore = transaction.objectStore('pokemon');

            const index = pokemonStore.index('name');
            const query = rawQuery.toLowerCase();

            transaction.onerror = (event) => {
                console.error('Transaction error:', event);
                reject(event);
            };

            const matchedPokemon: { pokemon: Pokemon, rank: number }[] = [];

            const startIndex = (page - 1) * pageSize;
            const stopIndex = startIndex + pageSize;

            let count = 0;
            index.openCursor().onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor) {
                    const pokemon: Pokemon = cursor.value;
                    const nameLowerCase = pokemon.name.toLowerCase();
                    const indexOfQuery = nameLowerCase.indexOf(query);

                    if (indexOfQuery !== -1) {
                        if (count >= startIndex && count < stopIndex) {
                            matchedPokemon.push({ pokemon, rank: indexOfQuery });
                        }
                        count++;
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

export function isDBEmpty(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        openDB().then((db) => {
            try {
                const transaction = db.transaction('pokemon', 'readonly');
                const pokemonStore = transaction.objectStore('pokemon');

                const request = pokemonStore.count();

                request.onerror = (event) => {
                    console.error('Request error:', event);
                    reject(event);
                };

                request.onsuccess = (event) => {
                    resolve(request.result === 0);
                };
            } catch (error) {
                console.error('Transaction error:', error);
                resolve(true); // Resolve as true if the object store does not exist
            }
        }).catch((error) => {
            console.error('Failed to open database:', error);
            reject(error);
        });
    });
}

export function isDBStale() {
    const lastUpdate = localStorage.getItem('lastUpdate');

    if (!lastUpdate) {
        return true;
    }

    const currentTime = new Date().getTime();
    const lastUpdateDate = new Date(lastUpdate).getTime();
    const timeSinceUpdate = currentTime - lastUpdateDate;
    const oneHour = 1000 * 60 * 60;

    console.log('Time since last update:', timeSinceUpdate);

    return timeSinceUpdate > oneHour;
    
}

export const typeColors = {
    POKEMON_TYPE_BUG: "#92BC2C",
    POKEMON_TYPE_DARK: "#595761",
    POKEMON_TYPE_DRAGON: "#0C69C8",
    POKEMON_TYPE_ELECTRIC: "#F2D94E",
    POKEMON_TYPE_FIRE: "#FBA54C",
    POKEMON_TYPE_FAIRY: "#EE90E6",
    POKEMON_TYPE_FIGHTING: "#D3425F",
    POKEMON_TYPE_FLYING: "#A1BBEC",
    POKEMON_TYPE_GHOST: "#5F6DBC",
    POKEMON_TYPE_GRASS: "#5FBD58",
    POKEMON_TYPE_GROUND: "#DA7C4D",
    POKEMON_TYPE_ICE: "#75D0C1",
    POKEMON_TYPE_NORMAL: "#A0A29F",
    POKEMON_TYPE_POISON: "#B763CF",
    POKEMON_TYPE_PSYCHIC: "#FA8581",
    POKEMON_TYPE_ROCK: "#C9BB8A",
    POKEMON_TYPE_STEEL: "#5695A3",
    POKEMON_TYPE_WATER: "#539DDF"
}

export function getTypeBackground(type: string): string {
    if (type.includes('_')) {
        type = type.split('_')[2];
    }
    type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    console.log("transformed type:", type);
    return `${BaseURL.PokeMiners}/Images/Catch%20Card/CatchCard_TypeBG_${type}.png`;
}

export function getMegaIconSmall(): string {
    return `${BaseURL.PokeMiners}/Images/Menu%20Icons/tex_mega_evolve_icon.png`;
}



export function getTotalPokemonCount(): Promise<number> {
    return new Promise((resolve, reject) => {
        openDB().then((db) => {
            const transaction = db.transaction('pokemon', 'readonly');
            const pokemonStore = transaction.objectStore('pokemon');

            const request = pokemonStore.count();

            request.onerror = (event) => {
                console.error('Request error:', event);
                reject(event);
            };

            request.onsuccess = (event) => {
                resolve(request.result);
            };
        }).catch((error) => {
            reject(error);
        });
    });
}

