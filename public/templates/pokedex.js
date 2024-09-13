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
exports.default = initPokedex;
const elements_1 = require("../elements");
const repo = __importStar(require("../util/repository"));
const sidebar = __importStar(require("../util/sidebar"));
const page_elements_1 = require("../util/page-elements");
function initPokedex(params, routeData) {
    console.log("pokedex");
    sidebar.selectPokedex();
    page_elements_1.BODY.style.backgroundImage = `var(--dex-bg-gradient)`;
    page_elements_1.BODY.style.backgroundColor = `var(--dex-bg-top)`;
    class PokemonLoader {
        pageNumber = 1;
        pageSize = 100;
        isSearched = false;
        container;
        spacer;
        main;
        dexSearchInput;
        bottomReached = false;
        totalPokemonCount = 0;
        constructor(containerId, spacerId, mainSelector, searchInputId) {
            this.container = document.getElementById(containerId);
            this.spacer = document.getElementById(spacerId);
            this.main = document.querySelector(mainSelector);
            this.dexSearchInput = document.getElementById(searchInputId);
            console.log("init PokemonLoader");
            this.init();
        }
        //dependency injection? more like dependency rejection
        async init() {
            this.totalPokemonCount = await repo.getTotalPokemonCount();
            await this.loadPage();
            this.setupEventListeners();
        }
        async loadPage(reset = false) {
            let result;
            if (this.isSearched) {
                result = await repo.searchPokemonByName(this.dexSearchInput.value, this.pageNumber, this.pageSize);
            }
            else {
                result = await repo.getAllPokemon(this.pageNumber, this.pageSize);
            }
            this.renderPokemon(result, reset);
        }
        renderPokemon(pokemonArray, reset = false) {
            if (reset) {
                this.container.innerHTML = "";
            }
            pokemonArray.forEach((pokemon) => {
                const pokemonCard = (0, elements_1.PokemonCard)(pokemon);
                this.container.appendChild(pokemonCard);
            });
            this.adjustSpacer();
        }
        //for discord style "filling the space in" lazy loading
        adjustSpacer() {
            const containerBottom = this.container.getBoundingClientRect().bottom;
            const viewportHeight = window.innerHeight;
            const remainingHeight = viewportHeight - containerBottom;
            if (remainingHeight > 0) {
                this.spacer.style.height = Math.max(remainingHeight, 0) + 'px';
            }
            else {
                this.spacer.style.height = '0px';
            }
        }
        //javascript nonsense
        setupEventListeners() {
            this.dexSearchInput.addEventListener("input", this.onSearchInput.bind(this));
            this.main.addEventListener("scroll", this.onScroll.bind(this));
        }
        async onSearchInput() {
            this.isSearched = this.dexSearchInput.value.length > 0;
            this.pageNumber = 1;
            await this.loadPage(true);
        }
        async onScroll() {
            if (this.bottomReached)
                return;
            const threshold = 400;
            const scrollable = this.main;
            if (Math.abs(scrollable.scrollHeight - scrollable.scrollTop - scrollable.clientHeight) <= threshold) {
                //checks first before trying to load more
                const maxPageNumber = Math.ceil(this.totalPokemonCount / this.pageSize);
                if (this.pageNumber >= maxPageNumber) {
                    this.bottomReached = true;
                    return;
                }
                this.pageNumber++;
                this.bottomReached = true;
                //save pos
                const lastElement = scrollable.querySelector('.card:last-child');
                const lastElementOffset = lastElement.offsetTop;
                const previousScrollTop = scrollable.scrollTop;
                await this.loadPage();
                //load pos
                const newLastElementOffset = lastElement.offsetTop;
                scrollable.scrollTop = previousScrollTop + (newLastElementOffset - lastElementOffset);
                //allow more load events
                this.bottomReached = false;
            }
        }
    }
    const pokemonLoader = new PokemonLoader('container', 'spacer', 'main', 'dex-search');
}
//# sourceMappingURL=pokedex.js.map