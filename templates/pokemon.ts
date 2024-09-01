import { PokemonCard, PokemonMoveset, PokemonShowcase, PokemonStats } from '../elements.js';
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

    const background = document.querySelector(".background") as HTMLImageElement;
    background.src = repo.getTypeBackground(pokemon.type1);



    const showcase = document.querySelector(".showcase") as HTMLElement;
    
    const pokemonShowcase = PokemonShowcase(pokemon);
    showcase.replaceWith(pokemonShowcase);

    const formSelector = document.querySelector(".form-selector") as HTMLElement;
    pokemon.regionForms.forEach((form) => {
        const formOption = document.createElement('input');
        formOption.type = 'radio';
        formOption.classList.add('form-option');
        formOption.name = 'form';
        formOption.id = form;

        const formLabel = document.createElement('label');
        formLabel.textContent = form;
        formLabel.htmlFor = form;
        formSelector.appendChild(formLabel);

        formOption.addEventListener('click', () => {
            window.location.href = `/pokedex/${form.toLowerCase()}`;
        });
        formSelector.appendChild(formOption);
    });

    const pokemonTitle = document.querySelector(".info > .title") as HTMLElement;
    const name = pokemonTitle.querySelector(".name") as HTMLElement;
    const dexNr = pokemonTitle.querySelector(".dex-nr") as HTMLElement;
    name.textContent = pokemon.name;
    dexNr.textContent = `#${pokemon.dexNr}`;



    const stats = document.querySelector(".stats") as HTMLElement;
    const pokemonStats = PokemonStats(pokemon);
    stats.replaceWith(pokemonStats);

    const quickMoves = document.querySelector(".quick-moves") as HTMLElement;
    const moveset = PokemonMoveset(pokemon.quickMoves);
    quickMoves.replaceWith(moveset);

    const chargedMoves = document.querySelector(".charged-moves") as HTMLElement;
    const chargedMoveset = PokemonMoveset(pokemon.chargedMoves);
    chargedMoves.replaceWith(chargedMoveset);

    const evolutions = document.querySelector(".evolutions") as HTMLElement;
    pokemon.evolutions.forEach((evolution) => {
        const evolutionCard = document.createElement('div');
        evolutionCard.classList.add('evolution');
        evolutionCard.innerHTML = `
            <div class="evolution-name">${evolution.formId}</div>
            <div class="evolution-candy">${evolution.candies} candies</div>
        `;
        evolutions.appendChild(evolutionCard);
    });

    


    const types = document.querySelector(".types") as HTMLElement;
    types.innerHTML = `
        <img class="type" src="${repo.getTypeIcon(pokemon.type1)}" />
        ${pokemon.type2 ? `<img class="type" src="${repo.getTypeIcon(pokemon.type2)}" />` : ""}
    `;
    
}