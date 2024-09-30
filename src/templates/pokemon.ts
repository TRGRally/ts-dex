import { PokemonCard, PokemonMoveset, PokemonShowcase, PokemonStats } from '../elements';
import * as repo from '../util/repository';
import * as sidebar from '../util/sidebar';
import { PAGE_CONTAINER, BODY } from '../util/page-elements'
import { Pokemon } from '../model/pokemon';


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
    console.log(pokemon);


    BODY.style.backgroundImage = 'unset';
    BODY.style.backgroundColor = `${repo.typeBackgroundColors[pokemon.type1]}`;
    PAGE_CONTAINER.style.backgroundImage = `unset`;


    const showcase = document.querySelector(".showcase") as HTMLElement;
    const pokemonShowcase = PokemonShowcase(pokemon);
    showcase.replaceWith(pokemonShowcase);


    let tintedContainers = document.querySelectorAll(".type-tinted") as NodeListOf<HTMLElement>;
    tintedContainers.forEach((container) => {
        //container.style.backgroundColor = `color-mix( in srgb, var(--bg1) 50%, ${repo.typeBackgroundColors[pokemon.type1]}`;
        container.style.backdropFilter = 'var(--color-blur)';   
    });


    const background = document.querySelector(".background") as HTMLElement;
    background.style.backgroundImage = `url('${repo.getTypeBackground(pokemon.type1)}')`;
    background.style.backgroundSize = '316px';
    background.style.backgroundRepeat = 'no-repeat';
    background.style.backgroundPosition = 'top left';
    

    const pokemonTitle = document.querySelector(".info > .title") as HTMLElement;
    const name = pokemonTitle.querySelector(".name") as HTMLElement;
    const dexNr = pokemonTitle.querySelector(".dex-nr") as HTMLElement;
    name.textContent = pokemon.name;
    dexNr.textContent = `#${pokemon.dexNr}`;


    const formSelector = document.querySelector(".form-selector") as HTMLElement;
    pokemon.regionForms.forEach((form) => {
        const formOption = document.createElement('input');
        formOption.type = 'radio';
        formOption.classList.add('form-option');
        formOption.name = 'form';
        formOption.id = form;

        const formLabel = document.createElement('a');
        formLabel.textContent = form;
        formLabel.href = `/pokedex/${form.toLowerCase()}`;


        formSelector.appendChild(formOption);
        formSelector.appendChild(formLabel);
    });

    if (pokemon.regionForms.length < 1) {
        formSelector.style.display = 'none';
    }

    const stats = document.querySelector(".stats") as HTMLElement;
    // const pokemonStats = PokemonStats(pokemon);
    // stats.replaceWith(pokemonStats);

    stats.remove(); // for now until there's actual UI for it


    const quickMoves = document.querySelector(".quick-moves") as HTMLElement;
    const moveset = PokemonMoveset(pokemon.quickMoves);
    quickMoves.replaceWith(moveset);


    const chargedMoves = document.querySelector(".charged-moves") as HTMLElement;
    const chargedMoveset = PokemonMoveset(pokemon.chargedMoves);
    chargedMoves.replaceWith(chargedMoveset);


    const evolutions = document.querySelector(".evolutions") as HTMLElement;
    pokemon.evolutions.forEach((evolution) => {
        const evolutionCard = document.createElement('a');
        evolutionCard.href = `/pokedex/${evolution.formId.toLowerCase()}`;
        evolutionCard.classList.add('evolution');
        evolutionCard.innerHTML = `
            <div class="evolution-name">${evolution.formId}</div>
            <div class="evolution-candy">${evolution.candies} candies</div>
        `;
        evolutions.appendChild(evolutionCard);
    });
    
    
}