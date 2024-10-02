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
exports.default = initPokemon;
const elements_1 = require("../elements");
const repo = __importStar(require("../util/repository"));
const sidebar = __importStar(require("../util/sidebar"));
const page_elements_1 = require("../util/page-elements");
function initPokemon(params, routeData) {
    console.log("pokemon");
    console.log("early resolved:", routeData);
    sidebar.selectPokedex();
    const pokemon = routeData;
    console.log(pokemon);
    page_elements_1.BODY.style.backgroundImage = 'unset';
    page_elements_1.BODY.style.backgroundColor = `${repo.typeBackgroundColors[pokemon.type1]}`;
    page_elements_1.PAGE_CONTAINER.style.backgroundImage = `unset`;
    const showcase = document.querySelector(".showcase");
    const pokemonShowcase = (0, elements_1.PokemonShowcase)(pokemon);
    showcase.replaceWith(pokemonShowcase);
    let tintedContainers = document.querySelectorAll(".type-tinted");
    tintedContainers.forEach((container) => {
        //container.style.backgroundColor = `color-mix( in srgb, var(--bg1) 50%, ${repo.typeBackgroundColors[pokemon.type1]}`;
        container.style.backdropFilter = 'var(--color-blur)';
    });
    const background = document.querySelector(".background");
    background.style.backgroundImage = `url('${repo.getTypeBackground(pokemon.type1)}')`;
    background.style.backgroundSize = '316px';
    background.style.backgroundRepeat = 'no-repeat';
    background.style.backgroundPosition = 'top left';
    const pokemonTitle = document.querySelector(".info > .title");
    const name = pokemonTitle.querySelector(".name");
    const dexNr = pokemonTitle.querySelector(".dex-nr");
    name.textContent = pokemon.name;
    dexNr.textContent = `#${pokemon.dexNr}`;
    const formSelector = document.querySelector(".form-selector");
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
    const stats = document.querySelector(".stats");
    // const pokemonStats = PokemonStats(pokemon);
    // stats.replaceWith(pokemonStats);
    stats.remove(); // for now until there's actual UI for it
    const quickMoves = document.querySelector(".quick-moves");
    const moveset = (0, elements_1.PokemonMoveset)(pokemon.quickMoves);
    quickMoves.replaceWith(moveset);
    const chargedMoves = document.querySelector(".charged-moves");
    const chargedMoveset = (0, elements_1.PokemonMoveset)(pokemon.chargedMoves);
    chargedMoves.replaceWith(chargedMoveset);
    const evolutions = document.querySelector(".evolutions");
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
//# sourceMappingURL=pokemon.js.map