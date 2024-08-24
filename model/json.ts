type PokemonTypeJson = {
    type: string;
    names: NamesJson;
}

type NamesJson = {
    English: string;
    French: string;
    German: string;
    Italian: string;
    Japanese: string;
    Korean: string;
    Spanish: string;
}

type AssetsJson = {
    image: string;
    shinyImage: string | null;
}

type StatsJson = {
    attack: number;
    defense: number;
    stamina: number;
}

type MoveJson = {
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

type BuffsJson = {
    activationChange: number;
    attackerAttackStatsChange: number;
    attackerDefenseStatsChange: number;
    targetAttackStatsChange: number;
    targetDefenseStatsChange: number;
}

type MegaEvolutionJson = {
    id: string;
    assets: AssetsJson;
    names: NamesJson;
    primaryType: PokemonTypeJson;
    secondaryType: PokemonTypeJson | null;
    stats: StatsJson;
}

type QuestJson = {
    id: string;
    names: NamesJson;
    type: string;
}

type EvolutionJson = {
    id: string;
    formId: string;
    candies: number;
    item: string | null;
    quests: QuestJson[]
}

type PokemonJson = {
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