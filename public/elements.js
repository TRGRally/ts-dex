"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PokemonCard = PokemonCard;
exports.PokemonStats = PokemonStats;
exports.PokemonEvolutions = PokemonEvolutions;
exports.PokemonMoveCard = PokemonMoveCard;
exports.PokemonMoveset = PokemonMoveset;
exports.PokemonShowcase = PokemonShowcase;
exports.RaidCard = RaidCard;
const repo = __importStar(require("./util/repository"));
function PokemonCard(pokemon) {
    //
    // I AM SORRY !
    //
    const isGenericForm = (pokemon.formId !== pokemon.id);
    const regions = {
        alola: pokemon.formId == ((pokemon.id).toString() + "_ALOLA"),
        galarian: pokemon.formId == ((pokemon.id).toString() + "_GALARIAN"),
        paldea: pokemon.formId == ((pokemon.id).toString() + "_PALDEA"),
        hisuian: pokemon.formId == ((pokemon.id).toString() + "_HISUIAN")
    };
    let region = "";
    let isRegional = false;
    if (regions.alola) {
        region = "Alola";
        isRegional = true;
    }
    if (regions.galarian) {
        region = "Galar";
        isRegional = true;
    }
    if (regions.paldea) {
        region = "Paldea";
        isRegional = true;
    }
    if (regions.hisuian) {
        region = "Hisui";
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
    let attributes = "";
    if (isGenericForm) {
        attributes = `
            <div class="attributes">
                ${regionAttribute}
                ${functionalAttribute}
            </div>
        `;
    }
    const hasImage = pokemon.imageUrl !== undefined;
    const pokemonCard = document.createElement('a');
    pokemonCard.classList.add('card');
    pokemonCard.innerHTML = `
        <img draggable="false" loading="lazy" src="${hasImage ? pokemon.imageUrl : '/assets/unknown.png'}" alt="${pokemon.name}" />
        <div class="type-icons"><img src="${repo.getTypeIcon(pokemon.type1)}" />${pokemon.type2 ? `<img src="${repo.getTypeIcon(pokemon.type2)}" />` : ""}</div>
        <div class="card-title"><span class="dexNr">#${pokemon.dexNr}</span> <span>${pokemon.name}</span></div>
        ${attributes}
    `;
    pokemonCard.setAttribute('href', `/pokedex/${pokemon.formId.toLowerCase()}`);
    pokemonCard.style.setProperty('--bg-color', `${repo.typeColors[pokemon.type1]}ff`);
    if (!hasImage) {
        pokemonCard.classList.add('unknown');
    }
    return pokemonCard;
}
function PokemonStats(pokemon) {
    const stats = pokemon.stats;
    const statsElement = document.createElement('div');
    statsElement.classList.add('stats');
    statsElement.innerHTML = `
        <div class="stat">
            <div class="stat-name">ATK</div>
            <progress class="stat-bar" value="${stats.attack}" max="300"></progress>
            <div class="stat-value">${stats.attack}</div>
        </div>
        <div class="stat">
            <div class="stat-name">DEF</div>
            <progress class="stat-bar" value="${stats.defense}" max="300"></progress>
            <div class="stat-value">${stats.defense}</div>
        </div>
        <div class="stat">
            <div class="stat-name">HP </div>
            <progress class="stat-bar" value="${stats.stamina}" max="300"></progress>
            <div class="stat-value">${stats.stamina}</div>
        </div>
    `;
    return statsElement;
}
function PokemonEvolutions(evolutions) {
    const evolutionElement = document.createElement('div');
    evolutionElement.classList.add('evolutions');
    evolutions.forEach((evolution) => {
        const evolutionCard = document.createElement('div');
        evolutionCard.classList.add('evolution');
        evolutionCard.innerHTML = `
            <div class="evolution-name">${evolution.formId}</div>
            <div class="evolution-candy">${evolution.candies} candies</div>
        `;
        evolutionElement.appendChild(evolutionCard);
    });
    return evolutionElement;
}
function PokemonMoveCard(move) {
    const moveElement = document.createElement('div');
    moveElement.attributes['data-id'] = move.id;
    moveElement.classList.add('move');
    let legacyEffect = "";
    if (move.isLegacy) {
        moveElement.classList.add('legacy');
        legacyEffect = `<img class="legacy-effect" src="https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Effects/ring_spike_sharp.png"></img>`;
    }
    moveElement.innerHTML = `
        <div class="move-type"><img src="${repo.getTypeIcon(move.type)}" /></div>
        <div class="move-name">${move.name}</div>
        ${legacyEffect}
    `;
    return moveElement;
}
function PokemonMoveset(moves) {
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
    const title = document.createElement('div');
    title.classList.add('title');
    title.textContent = "Moves";
    moveset.appendChild(title);
    moves.forEach((move) => {
        const moveElement = PokemonMoveCard(move);
        moveset.appendChild(moveElement);
    });
    return moveset;
}
function PokemonShowcase(pokemon) {
    const showcase = document.createElement('div');
    showcase.classList.add('showcase');
    const hasEvolutions = pokemon.evolutions.length > 0;
    const family = `
        <div class="family ${!hasEvolutions ? 'disabled' : ''}">
            <a class="family-nav-item left">
                <span class="material-symbols-rounded">arrow_back</span>
            </a>
            <a class="family-nav-item right">
                <span class="material-symbols-rounded">arrow_forward</span>
            </a>
        </div>
    `;
    const types = document.createElement('div');
    types.classList.add('types');
    types.classList.add('type-tinted');
    types.innerHTML = `
        <img class="type" src="${repo.getTypeIcon(pokemon.type1)}" />
        ${pokemon.type2 ? `<img class="type" src="${repo.getTypeIcon(pokemon.type2)}" />` : ""}
    `;
    showcase.innerHTML = `
        ${family}
        <img class="pokemon-image" draggable="false" src="${pokemon.imageUrl || "/assets/unknown.png"}" />
        ${pokemon.megaEvolutions.length > 0 ? `<img class="mega-icon" draggable="false" src="${repo.getMegaIconSmall()}" />` : ''}
    `;
    showcase.appendChild(types);
    return showcase;
}
function RaidCard(raid) {
    const raidCard = document.createElement('a');
    raidCard.classList.add('card');
    raidCard.innerHTML = `
        <img draggable="false" src="${raid.pokemon.imageUrl || "/assets/unknown.png"}" />
        <div class="card-title"><span>${raid.pokemon.name}</span></div>
    `;
    raidCard.setAttribute('href', `/raids/${raid.pokemon.formId.toLowerCase()}`);
    return raidCard;
}
//# sourceMappingURL=elements.js.map