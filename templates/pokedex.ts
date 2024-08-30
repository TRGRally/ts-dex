import { PokemonCard } from '../elements.js';
import * as repo from '../util/repository.js';
import * as sidebar from '../util/sidebar.js';


export default function initPokedex(
    params: { 
        [key: string]: string 
    }, 
    routeData: { 
        [key: string]: string 
    }
): void {
    console.log("pokedex");
    sidebar.selectPokedex();

    const container = document.getElementById('container');

    repo.getAllPokemon().then((allPokemon) => {
        allPokemon.sort((a, b) => a.dexNr - b.dexNr);
        renderPokemon(allPokemon);
    });
    
    function renderPokemon(pokemonArray: Pokemon[]): void {

        container.innerHTML = "";
    
        pokemonArray.forEach((pokemon) => {
    
            
            const pokemonCard = PokemonCard(pokemon);
            
    
            container.appendChild(pokemonCard);
        });
    }
    
    const dexSearchInput = document.getElementById("dex-search") as HTMLInputElement
    dexSearchInput.addEventListener("input", async (e) => {
        let result = await repo.searchPokemonByName(dexSearchInput.value)
        console.log(result)
        renderPokemon(result);
    });

    const dexSelector = document.querySelector(".dex-selector") as HTMLElement;
    dexSelector.addEventListener("click", async (e) => {

        let clickedElement = e.target as HTMLElement;
        while (clickedElement && !clickedElement.classList.contains("option")) {
            clickedElement = clickedElement.parentElement;
        }
        if (clickedElement) {
            const options = Array.from(document.querySelectorAll(".option"));
            options.forEach(option => option.classList.remove("active"));
            clickedElement.classList.add("active");
        }

        dexSelector.classList.toggle("open");

        
    });

}