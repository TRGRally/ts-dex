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
const router_1 = require("../router");
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
        loadedPages = [];
        gridDimensions;
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
            this.gridDimensions = this.calculateGridHeight();
            await this.loadPage(true);
            this.setupEventListeners();
            // const scrollPosition = sessionStorage.getItem("scrollPosition");
            // if (scrollPosition) {
            //     this.main.scrollTop = parseInt(scrollPosition);
            //     console.warn("scrolling to", scrollPosition);
            // }
        }
        async loadPage(reset = false) {
            let result;
            if (this.isSearched) {
                result = await repo.searchPokemonByName(this.dexSearchInput.value, this.pageNumber, this.pageSize);
            }
            else {
                result = await repo.getAllPokemon(this.pageNumber, this.pageSize);
            }
            console.warn(result);
            this.renderPokemon(result, reset);
            this.loadedPages.push(this.pageNumber);
        }
        renderPokemon(pokemonArray, reset = false) {
            if (reset) {
                console.warn("resetting pokemon grid");
                this.container.innerHTML = "";
            }
            console.warn("rendering pokemon");
            pokemonArray.forEach((pokemon) => {
                const pokemonCard = (0, elements_1.PokemonCard)(pokemon);
                this.container.appendChild(pokemonCard);
            });
            this.adjustSpacer();
        }
        calculateGridHeight() {
            const computedStyle = getComputedStyle(this.container);
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
            const columnWidthMatch = computedStyle.getPropertyValue('grid-template-columns').match(/(\d+)px/);
            const columnWidth = columnWidthMatch ? parseFloat(columnWidthMatch[1]) : 0;
            const rowHeightMatch = computedStyle.getPropertyValue('grid-auto-rows').match(/(\d+)px/);
            const rowHeight = rowHeightMatch ? parseFloat(rowHeightMatch[1]) : 0;
            //grid gap
            const gapValue = computedStyle.getPropertyValue('gap') || computedStyle.getPropertyValue('grid-gap') || '0px';
            let gapInPixels;
            if (gapValue.includes('rem')) {
                gapInPixels = parseFloat(gapValue) * rootFontSize;
            }
            else {
                gapInPixels = parseFloat(gapValue);
            }
            gapInPixels = isNaN(gapInPixels) ? 0 : gapInPixels;
            //bottom padding
            const paddingBottomValue = computedStyle.getPropertyValue('padding-bottom') || '0px';
            let paddingBottomInPixels;
            if (paddingBottomValue.includes('rem')) {
                paddingBottomInPixels = parseFloat(paddingBottomValue) * rootFontSize;
            }
            else {
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
        adjustSpacer() {
            if (this.isSearched)
                return;
            const totalHeight = this.gridDimensions.totalHeight;
            const lastCard = this.container.querySelector('.card:last-child');
            const lastCardRect = lastCard?.getBoundingClientRect() || { bottom: 0 };
            //get this in terms of its position in the container
            const lastCardBottom = lastCardRect.bottom - this.container.getBoundingClientRect().top;
            const spacerHeight = totalHeight - lastCardBottom;
            console.warn("spacerHeight", spacerHeight);
            console.warn(this.bottomReached);
            this.spacer.style.height = spacerHeight + 'px';
        }
        //javascript nonsense
        setupEventListeners() {
            this.dexSearchInput.addEventListener("input", this.onSearchInput.bind(this));
            this.main.addEventListener("scroll", this.onScroll.bind(this));
            window.addEventListener("resize", () => {
                this.gridDimensions = this.calculateGridHeight();
                this.adjustSpacer();
            });
        }
        setSearchTerm(searchTerm) {
            this.dexSearchInput.value = searchTerm;
            this.onSearchInput();
        }
        async onSearchInput() {
            this.isSearched = this.dexSearchInput.value.length > 0;
            this.pageNumber = 1;
            router_1.Router.updateQueryParams(this.isSearched ? { search: this.dexSearchInput.value } : null);
            await this.loadPage(true);
        }
        calculatePageToLoad(scrollPos = 0) {
            //derranged code attempting a minecraft chunk style grid loading system
            const { rows, gap, columns } = this.gridDimensions;
            const rowHeight = 180 + gap;
            const rowNumber = Math.floor(scrollPos / rowHeight);
            const rowsPerPage = this.pageSize / columns;
            const fullRowsPerPage = Math.floor(rowsPerPage);
            const extraCellsPerPage = this.pageSize % columns;
            const page = rowNumber / rowsPerPage;
            const pageNumber = Math.ceil(page);
            console.log(pageNumber, page);
            const itemsBefore = (pageNumber - 1) * this.pageSize;
            console.warn(itemsBefore);
            const remainder = itemsBefore % columns;
            console.warn(remainder);
            //the cell the page will start on 
            const startRow = Math.floor(itemsBefore / columns);
            const startColumn = remainder;
            console.warn("Page will start on:", startRow, startColumn);
            return pageNumber;
        }
        async onScroll() {
            if (this.bottomReached)
                return;
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
    const searchTerm = routeData.queryParams?.search || "";
    const pokemonLoader = new PokemonLoader('container', 'spacer', 'main', 'dex-search');
    pokemonLoader.setSearchTerm(searchTerm);
}
//# sourceMappingURL=pokedex.js.map