import * as repo from '../util/repository.js';
import * as sidebar from '../util/sidebar.js';


export default function init(
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
    
            //
            // I AM SORRY !
            //
    
            const isGenericForm = (pokemon.formId !== pokemon.id);
            const regions = {
                alola: pokemon.formId == ((pokemon.id).toString() + "_ALOLA"),
                galarian: pokemon.formId == ((pokemon.id).toString() + "_GALARIAN"),
                paldea: pokemon.formId == ((pokemon.id).toString() + "_PALDEA"),
                hisuian: pokemon.formId == ((pokemon.id).toString() + "_HISUIAN")
            }
    
            let region: string = "";
            let isRegional: boolean = false;
    
            if (regions.alola) {
                region = "Alola"
                isRegional = true;
            }
            if (regions.galarian) {
                region = "Galar"
                isRegional = true;
            }
            if (regions.paldea) {
                region = "Paldea"
                isRegional = true;
            }
            if (regions.hisuian) {
                region = "Hisui"
                isRegional = true;
            }
    
            const isFunctionalForm = !isRegional && isGenericForm;
    
            let regionAttribute = "";
            let functionalAttribute = "";
    
            if (isRegional) {
                regionAttribute = `
                    <div class="attribute regional">
                        <span class="material-symbols-rounded">public</span>
                        <span class="text">${region}</span>
                    </div>
                `;
            }
    
            if (isFunctionalForm) {
                functionalAttribute = `
                    <div class="attribute functional">
                        <span class="material-symbols-rounded">category</span>
                    </div>
                `;
            }
    
            let attributes: string = "";
            if (isGenericForm) {
                attributes = `
                    <div class="attributes">
                        ${regionAttribute}
                        ${functionalAttribute}
                    </div>
                `
            }
    
            const pokemonCard = document.createElement('div');
            pokemonCard.classList.add('card');
            pokemonCard.innerHTML = `
                <img draggable="false" src="${ pokemon.imageUrl || "https://cdn.discordapp.com/emojis/1276312604406710303.gif?size=44&quality=lossless" }" />
                <div class="type-icons"><img src="${repo.getTypeIcon(pokemon.type1)}" />${pokemon.type2 ? `<img src="${repo.getTypeIcon(pokemon.type2)}" />` : ""}</div>
                <div class="card-title"><span class="dexNr">#${pokemon.dexNr}</span> ${pokemon.name}</div>
                ${attributes}
            `;
    
            pokemonCard.setAttribute('form-id', `/pokedex/${pokemon.formId.toLowerCase()}`);
    
            pokemonCard.addEventListener("click", () => {
                pokemonCard.classList.add("muted");
            })
    
            container.appendChild(pokemonCard);
        });
    }
    
    const dexSearchInput = document.getElementById("dex-search") as HTMLInputElement
    dexSearchInput.addEventListener("input", async (e) => {
        let result = await repo.searchPokemonByName(dexSearchInput.value)
        console.log(result)
        renderPokemon(result);
    });
}