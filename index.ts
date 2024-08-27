import * as repo from "./util/repository.js";

console.log(repo.allPokemonMap);

repo.initDB(repo.allPokemonMap);

repo.getAllPokemon().then((pokemon) => {
    console.log(pokemon);
});


const container = document.getElementById('container');

repo.getAllPokemon().then((allPokemon) => {
    allPokemon.sort((a, b) => a.dexNr - b.dexNr);
    renderPokemon(allPokemon);
});

const result = await repo.searchPokemonByName("pol");
console.log(result);


document.addEventListener('click', function(event) {
    if ((event.target as HTMLElement).classList.contains('toggle')) {
        console.log(event.target);
        (event.target as HTMLElement).classList.toggle("active");
    }
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

        console.table(regions);

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
            <div class="card-title"><span class="dexNr">#${pokemon.dexNr}</span> ${pokemon.name}</div>
            ${attributes}
        `;

        pokemonCard.setAttribute('data-form-id', `${pokemon.formId}`)

        pokemonCard.addEventListener("click", () => {
            console.log(pokemon)
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



