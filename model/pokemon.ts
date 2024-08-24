type PokemonType = string;

type Pokemon = {
    id: string;
    formId: string;
    name: string;
    dexNr: number;
    type1: PokemonType;
    type2: PokemonType | null;
    generation: number;
    imageUrl: string;
    stats: Stats;
    quickMoves: PokemonMove[];
    chargedMoves: PokemonMove[];
    shinyImageUrl: string | null;
    pokemonClass: string | null;
    regionForms: string[];
    evolutions: Evolution[];
    megaEvolutions: MegaEvolution[];
}

type MegaEvolution = {
    evolvesFrom: string;
    id: string;
    name: string;
    imageUrl: string;
    shinyImageUrl: string | null;
    stats: Stats;
    type1: PokemonType;
    type2: PokemonType | null;
}

type PokemonMove = {
    id: string;
    name: string;
    type: PokemonType;
    isLegacy: boolean;
    gym: MoveGymStats;
    combat: MoveCombatStats;
}

type Buffs = {
    activationChange: number;
    attackerAttackStatsChange: number;
    attackerDefenseStatsChange: number;
    targetAttackStatsChange: number;
    targetDefenseStatsChange: number;
}

type MoveCombatStats = {
    energy: number;
    power: number;
    turns: number;
    buffs: Buffs;
}

type MoveGymStats = {
    power: number;
    energy: number;
    durationMs: number;
}

type Evolution = {
    id: string;
    formId: string;
    candies: number;
    item: string | null;
    quests: Quest[]
}

type Quest = {
    id: string;
    name: string;
    type: string;
}

type Stats = {
    attack: number;
    defense: number;
    stamina: number;
}