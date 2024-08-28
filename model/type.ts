type WeatherBoost = {
    id: string;
    name: string;
    imageUrl: string;
}

type Type = {
    type: string;
    name: string;
    doubleDamageFrom: string[];
    halfDamageFrom: string[];
    noDamageFrom: string[];
    weatherBoost: WeatherBoost;
}