export type WeatherBoost = {
    id: string;
    name: string;
    imageUrl: string;
}

export type PokemonType = {
    type: string;
    name: string;
    imageUrl: string;
    doubleDamageFrom: string[];
    halfDamageFrom: string[];
    noDamageFrom: string[];
    weatherBoost: WeatherBoost;
}