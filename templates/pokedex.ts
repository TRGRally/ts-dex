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

    let pageNumber = 1; //will reset on input change 
    let pageSize = 100;
    let isSearched: boolean = false;

    const container = document.getElementById('container'); //where the card are appended to
    const spacer = document.getElementById('spacer'); //discord style continual scroll when lazy loading
    const main = document.querySelector('main'); //the scrollable element

    repo.getAllPokemon(pageNumber, pageSize).then((allPokemon) => {
        renderPokemon(allPokemon);
    });

    function renderPokemon(pokemonArray: Pokemon[], reset: boolean = false): void {
        
        if (reset) {
            container.innerHTML = "";
        }

        pokemonArray.forEach((pokemon) => {
            const pokemonCard = PokemonCard(pokemon);
            container.appendChild(pokemonCard);
        });

        const remainingHeight = window.innerHeight - container.getBoundingClientRect().bottom;
        spacer.style.height = Math.max(remainingHeight, 400) + 'px';
    }


    const dexSearchInput = document.getElementById("dex-search") as HTMLInputElement
    dexSearchInput.addEventListener("input", async (e) => {

        if (dexSearchInput.value.length < 1) {
            isSearched = false;
        } else {
            isSearched = true;
        }
        pageNumber = 1;

        let result: Pokemon[];
        if (isSearched) {
            result = await repo.searchPokemonByName(dexSearchInput.value, pageNumber, pageSize);
        } else {
            result = await repo.getAllPokemon(pageNumber, pageSize);
        }

        console.log(result)
        renderPokemon(result, true);
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

    //lazy loading scroll
    let bottomReached = false;
    main.addEventListener("scroll", async (e) => {
        const scrollable = e.target as HTMLElement;

        if (bottomReached) {
            return;
        }

        const threshold = 400;
        if (Math.abs(scrollable.scrollHeight - scrollable.scrollTop - scrollable.clientHeight) <= threshold) {
            console.log("bottom reached");
            bottomReached = true;
    
            pageNumber++;
            let result: Pokemon[];
            if (isSearched) {
                result = await repo.searchPokemonByName(dexSearchInput.value, pageNumber, pageSize);
            } else {
                result = await repo.getAllPokemon(pageNumber, pageSize);
            }

            //save pos
            const lastElement = scrollable.querySelector('.card:last-child') as HTMLElement;
            const lastElementOffset = lastElement.offsetTop;
            const previousScrollTop = scrollable.scrollTop;
    
            renderPokemon(result);
    
            //load pos
            const newLastElementOffset = lastElement.offsetTop;
            scrollable.scrollTop = previousScrollTop + (newLastElementOffset - lastElementOffset);

            //allow more load events
            bottomReached = false;
        }
    });
    
    

}