import { PokemonCard, PokemonShowcase, PokemonStats } from '../elements.js';
import * as repo from '../util/repository.js';
import * as sidebar from '../util/sidebar.js';


export default function initPokemon(
    params: { 
        [key: string]: string 
    }, 
    routeData: { 
        [key: string]: string 
    }
): void {
    console.log("pokemon");
    console.log("early resolved:", routeData);
    sidebar.selectPokedex();

    const pokemon = routeData as unknown as Pokemon;

    const showcase = document.querySelector(".showcase") as HTMLElement;
    
    const pokemonShowcase = PokemonShowcase(pokemon);
    showcase.replaceWith(pokemonShowcase);

    const stats = document.querySelector(".stats") as HTMLElement;
    const pokemonStats = PokemonStats(pokemon);
    stats.replaceWith(pokemonStats);

    const types = document.querySelector(".types") as HTMLElement;
    types.innerHTML = `
        <img src="${repo.getTypeIcon(pokemon.type1)}" />
        ${pokemon.type2 ? `<img src="${repo.getTypeIcon(pokemon.type2)}" />` : ""}
    `;
    
}