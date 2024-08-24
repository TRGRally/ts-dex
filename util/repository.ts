enum BaseURL {
    PokedexAPI = 'https://pokemon-go-api.github.io/pokemon-go-api/api',
}

const pokemonData = await fetchPokemonJson(); 
const regionForms = extractRegionForms(pokemonData);
const allPokemonData = pokemonData.concat(regionForms);

export const allPokemon = getPokemonArray(allPokemonData);

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