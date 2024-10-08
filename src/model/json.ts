export type WeatherBoostJson = {
    id: string;
    names: NamesJson;
    assetName: string;
}

//the more complete format given in types.json
export type TypeJson = {
    type: string;
    names: NamesJson;
    imageUrl: string;
    doubleDamageFrom: string[];
    halfDamageFrom: string[];
    noDamageFrom: string[];
    weatherBoost: WeatherBoostJson;
}

//specifically the format given in pokemon.json
export type PokemonTypeJson = {
    type: string;
    names: NamesJson;
}

export type NamesJson = {
    English: string;
    French: string;
    German: string;
    Italian: string;
    Japanese: string;
    Korean: string;
    Spanish: string;
}

export type AssetsJson = {
    image: string;
    shinyImage: string | null;
}

export type StatsJson = {
    attack: number;
    defense: number;
    stamina: number;
}

export type MoveJson = {
    id: string;
    power: number;
    energy: number;
    durationMs: number;
    type: {
        type: string;
        names: NamesJson;
    };
    names: NamesJson;
    combat: {
        energy: number;
        power: number;
        turns: number;
        buffs: BuffsJson | null;
    };
};

export type BuffsJson = {
    activationChange: number;
    attackerAttackStatsChange: number;
    attackerDefenseStatsChange: number;
    targetAttackStatsChange: number;
    targetDefenseStatsChange: number;
}

export type MegaEvolutionJson = {
    id: string;
    assets: AssetsJson;
    names: NamesJson;
    primaryType: PokemonTypeJson;
    secondaryType: PokemonTypeJson | null;
    stats: StatsJson;
}

export type QuestJson = {
    id: string;
    names: NamesJson;
    type: string;
}

export type EvolutionJson = {
    id: string;
    formId: string;
    candies: number;
    item: string | null;
    quests: QuestJson[]
}

export type PokemonJson = {
    id: string;
    formId: string;
    names: NamesJson;
    dexNr: number;
    generation: number;
    pokemonClass: string | null;
    primaryType: PokemonTypeJson;
    secondaryType: PokemonTypeJson | null;
    stats: StatsJson;
    assets: AssetsJson;
    regionForms: { [key: string]: PokemonJson };
    megaEvolutions: { [key: string]: MegaEvolutionJson };
    evolutions: { [key: string]: EvolutionJson };
    cinematicMoves: { [key: string]: MoveJson };
    eliteCinematicMoves: { [key: string]: MoveJson };
    quickMoves: { [key: string]: MoveJson };
    eliteQuickMoves: { [key: string]: MoveJson };
}

export type PokeBattlerJson = {
    pokemonId: string;
    familyId: string;
    pokedexHeightM: number;
    pokedexWeightKg: number;
    heightStdDev: number;
    weightStdDev: number;
    thirdMove: {
        stardustToUnlock: number;
        candyToUnlock: number;
    }
}

export type ContainsBreakingNewsJson = {
    breakingNews: BreakingNewsJson;
}

export type BreakingNewsJson = {
    id: number;
    pokemon: string;
    shiny: boolean;
    tier: string;
    type: string;
    localTime: boolean;
    startDate: number;
    endDate: number;
    activeDate: number;
};