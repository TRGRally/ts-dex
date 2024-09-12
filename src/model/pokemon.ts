import { PokemonType } from "./type";


export type Pokemon = {
    id: string;
    formId: string;
    name: string;
    dexNr: number;
    type1: string;
    type2: string | null;
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
    familyId?: string;
    thirdMoveCost?: ThirdMoveCost;
    height?: number;
    weight?: number;
    heightStdDev?: number;
    weightStdDev?: number;
}

export type MegaEvolution = {
    evolvesFrom: string;
    id: string;
    name: string;
    imageUrl: string;
    shinyImageUrl: string | null;
    stats: Stats;
    type1: string;
    type2: string | null;
}

export type PokemonMove = {
    id: string;
    name: string;
    type: string;
    isLegacy: boolean;
    gym: MoveGymStats;
    combat: MoveCombatStats;
}

export type Buffs = {
    activationChange: number;
    attackerAttackStatsChange: number;
    attackerDefenseStatsChange: number;
    targetAttackStatsChange: number;
    targetDefenseStatsChange: number;
}

export type MoveCombatStats = {
    energy: number;
    power: number;
    turns: number;
    buffs: Buffs;
}

export type MoveGymStats = {
    power: number;
    energy: number;
    durationMs: number;
}

export type ThirdMoveCost = {
    stardust: number;
    candy: number;
}

export type Evolution = {
    id: string;
    formId: string;
    candies: number;
    item: string | null;
    quests: Quest[]
}

export type Quest = {
    id: string;
    name: string;
    type: string;
}

export type Stats = {
    attack: number;
    defense: number;
    stamina: number;
}