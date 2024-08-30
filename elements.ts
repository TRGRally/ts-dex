import * as repo from "./util/repository.js";

export function PokemonCard(pokemon: Pokemon): HTMLElement {

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
    const pokemonCard = document.createElement('a');
    pokemonCard.classList.add('card');
    pokemonCard.innerHTML = `
        <img draggable="false" src="${ pokemon.imageUrl || "/assets/unknown.png" }" />
        <div class="type-icons"><img src="${repo.getTypeIcon(pokemon.type1)}" />${pokemon.type2 ? `<img src="${repo.getTypeIcon(pokemon.type2)}" />` : ""}</div>
        <div class="card-title"><span class="dexNr">#${pokemon.dexNr}</span> <span>${pokemon.name}</span></div>
        ${attributes}
    `;

    pokemonCard.setAttribute('href', `/pokedex/${pokemon.formId.toLowerCase()}`);
    pokemonCard.style.setProperty('--bg-color', `${repo.typeColors[pokemon.type1]}ff`);

    return pokemonCard;
}

export function PokemonStats(pokemon: Pokemon): HTMLElement {
    const stats = pokemon.stats;
    const statsElement = document.createElement('div');
    statsElement.classList.add('stats');

    statsElement.innerHTML = `
        <div class="stat">
            <div class="stat-name">ATK</div>
            <div class="stat-value">${stats.attack}</div>
            <progress class="stat-bar" value="${stats.attack}" max="300"></progress>
        </div>
        <div class="stat">
            <div class="stat-name">DEF</div>
            <div class="stat-value">${stats.defense}</div>
            <progress class="stat-bar" value="${stats.defense}" max="300"></progress>
        </div>
        <div class="stat">
            <div class="stat-name">HP </div>
            <div class="stat-value">${stats.stamina}</div>
            <progress class="stat-bar" value="${stats.stamina}" max="300"></progress>
        </div>
    `;

    return statsElement;

}

export function PokemonMove(move: PokemonMove): HTMLElement {
    const moveElement = document.createElement('div');
    moveElement.attributes['data-id'] = move.id;
    moveElement.classList.add('move');

    if (move.isLegacy) {
        moveElement.classList.add('legacy');
    }

    moveElement.innerHTML = `
        <div class="move-type"><img src="${repo.getTypeIcon(move.type)}" /></div>
        <div class="move-name">${move.name}</div>
    `;

    return moveElement;
}

export function PokemonMoveset(moves: PokemonMove[]): HTMLElement {
    const moveset = document.createElement('div');
    moveset.classList.add('moveset');

    //legacy move priority
    moves.sort((a, b) => {
        if (a.isLegacy && !b.isLegacy) {
            return -1;
        }
        if (!a.isLegacy && b.isLegacy) {
            return 1;
        }
        return 0;
    });

    moves.forEach((move) => {
        moveset.appendChild(PokemonMove(move));
    });

    return moveset;
}



export function PokemonShowcase(pokemon: Pokemon): HTMLElement {
    const showcase = document.createElement('div');
    showcase.classList.add('showcase');
    const backgroundImage = repo.getTypeBackground(pokemon.type1);
    showcase.style.backgroundImage = `url('${backgroundImage}')`;


    showcase.innerHTML = `
        <img draggable="false" src="${pokemon.imageUrl || "/assets/unknown.png"}" />
    
        <div class="card-title">
            <span class="dexNr">#${pokemon.dexNr}</span> 
            <span>${pokemon.name}</span>
        </div>
    
        ${pokemon.megaEvolutions.length > 0 ? `<img draggable="false" src="${repo.getMegaIconSmall()}" />` : ''}
    `;

    return showcase;
}