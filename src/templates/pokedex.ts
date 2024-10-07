import { PokemonCard } from '../elements';
import * as repo from '../util/repository';
import * as sidebar from '../util/sidebar';
import { PAGE_CONTAINER, BODY } from '../util/page-elements';
import { Pokemon } from '../model/pokemon';
import { Router } from '../router';


export default function initPokedex(
    params: {
        [key: string]: string
    },
    routeData: {
        [key: string]: any
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
        private loadedPages: number[] = [];
        private gridDimensions: { 
            columns: number, 
            rows: number, 
            totalHeight: number,
            gap: number
        };

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
            await this.loadPage(true);
            this.setupEventListeners();
            // const scrollPosition = sessionStorage.getItem("scrollPosition");
            // if (scrollPosition) {
            //     this.main.scrollTop = parseInt(scrollPosition);
            //     console.warn("scrolling to", scrollPosition);
            // }
        }

        private async loadPage(reset: boolean = false) {
            let result: Pokemon[];
            if (this.isSearched) {
                result = await repo.searchPokemonByName(this.dexSearchInput.value, this.pageNumber, this.pageSize);
            } else {
                result = await repo.getAllPokemon(this.pageNumber, this.pageSize);
            }
            console.warn(result);
            this.renderPokemon(result, reset);
            this.loadedPages.push(this.pageNumber);
        }

        private renderPokemon(pokemonArray: Pokemon[], reset: boolean = false): void {
            if (reset) {
                console.warn("resetting pokemon grid");
                this.container.innerHTML = "";
            }

            console.warn("rendering pokemon");

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
                totalHeight: totalHeight,
                gap: gapInPixels
            };
        }


        //for discord style "filling the space in" lazy loading
        private adjustSpacer(): void {

            if (this.isSearched) return;

            const totalHeight = this.gridDimensions.totalHeight;
            const lastCard: HTMLElement | null = this.container.querySelector('.card:last-child');

            const lastCardRect = lastCard?.getBoundingClientRect() || { bottom: 0 };
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

        public setSearchTerm(searchTerm: string) {
            this.dexSearchInput.value = searchTerm;
            this.onSearchInput();
        }

        private async onSearchInput() {
            this.isSearched = this.dexSearchInput.value.length > 0;
            this.pageNumber = 1;
            Router.updateQueryParams(this.isSearched ? { search: this.dexSearchInput.value } : null);
            await this.loadPage(true);
        }

        private calculatePageToLoad(scrollPos: number = 0): number {
            //derranged code attempting a minecraft chunk style grid loading system
            const { rows, gap, columns } = this.gridDimensions;

            const rowHeight = 180 + gap;
            const rowNumber = Math.floor(scrollPos / rowHeight);
            const rowsPerPage = this.pageSize / columns;
            const fullRowsPerPage = Math.floor(rowsPerPage);
            const extraCellsPerPage = this.pageSize % columns;

            const page = rowNumber / rowsPerPage
            const pageNumber = Math.ceil(page);
            console.log(pageNumber, page);

            const itemsBefore = (pageNumber - 1) * this.pageSize
            console.warn(itemsBefore);

            const remainder = itemsBefore % columns;
            console.warn(remainder);

            //the cell the page will start on 
            const startRow = Math.floor(itemsBefore / columns);
            const startColumn = remainder;
            console.warn("Page will start on:", startRow, startColumn);

            return pageNumber;

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
                const lastPosition = scrollable.scrollTop;
                const pageNumber = this.calculatePageToLoad(lastPosition);

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

    const searchTerm: string = routeData.queryParams?.search || "";

    const pokemonLoader = new PokemonLoader('container', 'spacer', 'main', 'dex-search');
    pokemonLoader.setSearchTerm(searchTerm);



}