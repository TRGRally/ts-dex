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

    class PokemonLoader {
        private pageNumber: number = 1;
        private pageSize: number = 100;
        private isSearched: boolean = false;
        private container: HTMLElement;
        private spacer: HTMLElement;
        private main: HTMLElement;
        private dexSearchInput: HTMLInputElement;
        private bottomReached: boolean = false;
        private totalPokemonCount: number = 0;
    
        constructor(containerId: string, spacerId: string, mainSelector: string, searchInputId: string) {
            this.container = document.getElementById(containerId);
            this.spacer = document.getElementById(spacerId);
            this.main = document.querySelector(mainSelector);
            this.dexSearchInput = document.getElementById(searchInputId) as HTMLInputElement;
            
            console.log("init PokemonLoader");
            this.init();
        }
        
        //dependency injection? more like dependency rejection
        private async init() {
            this.totalPokemonCount = await repo.getTotalPokemonCount();
            await this.loadPage();
            this.setupEventListeners();
        }
    
        private async loadPage(reset: boolean = false) {
            let result: Pokemon[];
            if (this.isSearched) {
                result = await repo.searchPokemonByName(this.dexSearchInput.value, this.pageNumber, this.pageSize);
            } else {
                result = await repo.getAllPokemon(this.pageNumber, this.pageSize);
            }
    
            this.renderPokemon(result, reset);
        }
    
        private renderPokemon(pokemonArray: Pokemon[], reset: boolean = false): void {
            if (reset) {
                this.container.innerHTML = "";
            }
    
            pokemonArray.forEach((pokemon) => {
                const pokemonCard = PokemonCard(pokemon);
                this.container.appendChild(pokemonCard);
            });
    
            this.adjustSpacer();
        }
        
        //for discord style "filling the space in" lazy loading
        private adjustSpacer(): void {
            const containerBottom = this.container.getBoundingClientRect().bottom;
            const viewportHeight = window.innerHeight;
            const remainingHeight = viewportHeight - containerBottom;
            
            if (remainingHeight > 0) {
                this.spacer.style.height = Math.max(remainingHeight, 0) + 'px';
            } else {
                this.spacer.style.height = '0px';
            }
        }
        
        //javascript nonsense
        private setupEventListeners() {
            this.dexSearchInput.addEventListener("input", this.onSearchInput.bind(this));
            this.main.addEventListener("scroll", this.onScroll.bind(this));
        }
    
        private async onSearchInput() {
            this.isSearched = this.dexSearchInput.value.length > 0;
            this.pageNumber = 1;
            await this.loadPage(true);
        }
    
        private async onScroll() {
            if (this.bottomReached) return;
    
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
                const lastElement = scrollable.querySelector('.card:last-child') as HTMLElement;
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