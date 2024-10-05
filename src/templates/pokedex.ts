import { PokemonCard } from '../elements';
import * as repo from '../util/repository';
import * as sidebar from '../util/sidebar';
import { PAGE_CONTAINER, BODY } from '../util/page-elements';
import { Pokemon } from '../model/pokemon';


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
    BODY.style.backgroundImage = `var(--dex-bg-gradient)`;
    BODY.style.backgroundColor = `var(--dex-bg-top)`;


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
        private gridDimensions: { columns: number, rows: number, totalHeight: number };

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
            this.gridDimensions = this.calculateGridHeight();
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

        private calculateGridHeight() {
            const computedStyle = getComputedStyle(this.container);
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

            const columnWidthMatch = computedStyle.getPropertyValue('grid-template-columns').match(/(\d+)px/);
            const columnWidth = columnWidthMatch ? parseFloat(columnWidthMatch[1]) : 0;
            const rowHeightMatch = computedStyle.getPropertyValue('grid-auto-rows').match(/(\d+)px/);
            const rowHeight = rowHeightMatch ? parseFloat(rowHeightMatch[1]) : 0;

            //grid gap
            const gapValue = computedStyle.getPropertyValue('gap') || computedStyle.getPropertyValue('grid-gap') || '0px';
            let gapInPixels: number;
            if (gapValue.includes('rem')) {
                gapInPixels = parseFloat(gapValue) * rootFontSize;
            } else {
                gapInPixels = parseFloat(gapValue);
            }
            
            gapInPixels = isNaN(gapInPixels) ? 0 : gapInPixels;

            //bottom padding
            const paddingBottomValue = computedStyle.getPropertyValue('padding-bottom') || '0px';
            let paddingBottomInPixels: number;
            if (paddingBottomValue.includes('rem')) {
                paddingBottomInPixels = parseFloat(paddingBottomValue) * rootFontSize;
            } else {
                paddingBottomInPixels = parseFloat(paddingBottomValue);
            }

            paddingBottomInPixels = isNaN(paddingBottomInPixels) ? 0 : paddingBottomInPixels;

            const containerWidth = this.container.clientWidth;

            const numColumns = Math.floor((containerWidth + gapInPixels) / (columnWidth + gapInPixels)) || 1;
            const adjustedNumColumns = numColumns > 0 ? numColumns : 1;
            const numRows = Math.ceil(this.totalPokemonCount / adjustedNumColumns);

            // Calculate the total height
            const totalHeight = numRows * rowHeight + (numRows - 1) * gapInPixels + paddingBottomInPixels;
            console.warn("totalHeight", totalHeight);
            console.warn("numColumns", numColumns);
            console.warn("numRows", numRows);
            return {
                columns: adjustedNumColumns,
                rows: numRows,
                totalHeight: totalHeight
            };
        }


        //for discord style "filling the space in" lazy loading
        private adjustSpacer(): void {

            const totalHeight = this.gridDimensions.totalHeight;
            const lastCard = this.container.querySelector('.card:last-child') as HTMLElement;
            const lastCardRect = lastCard.getBoundingClientRect();
            //get this in terms of its position in the container
            const lastCardBottom = lastCardRect.bottom - this.container.getBoundingClientRect().top;

            const spacerHeight = totalHeight - lastCardBottom;
            console.warn("spacerHeight", spacerHeight);
            console.warn(this.bottomReached);
            this.spacer.style.height = spacerHeight + 'px';
        }

        //javascript nonsense
        private setupEventListeners() {
            this.dexSearchInput.addEventListener("input", this.onSearchInput.bind(this));
            this.main.addEventListener("scroll", this.onScroll.bind(this));
            window.addEventListener("resize", () => {
                this.gridDimensions = this.calculateGridHeight();
                this.adjustSpacer();
            });
        }

        private async onSearchInput() {
            this.isSearched = this.dexSearchInput.value.length > 0;
            this.pageNumber = 1;
            await this.loadPage(true);
        }

        private async onScroll() {
            if (this.bottomReached) return;

            const threshold = window.innerHeight * 2;
            const scrollable = this.main;
            const spacer = this.spacer;
            const spacerTop = spacer.getBoundingClientRect().top;

            if (spacerTop < threshold) {

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

                //if null last element, don't bother
                if (!lastElement) return;

                // const lastElementOffset = lastElement.offsetTop;
                // const previousScrollTop = scrollable.scrollTop;

                await this.loadPage();

                //load pos
                // const newLastElementOffset = lastElement.offsetTop;
                // scrollable.scrollTop = previousScrollTop + (newLastElementOffset - lastElementOffset);

                //allow more load events
                this.bottomReached = false;
            }
        }
    }


    const pokemonLoader = new PokemonLoader('container', 'spacer', 'main', 'dex-search');

}