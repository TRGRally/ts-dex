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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = exports.routes = void 0;
const repo = __importStar(require("./util/repository"));
const sidebar = __importStar(require("./util/sidebar"));
const pokedex_1 = __importDefault(require("./templates/pokedex"));
const pokemon_1 = __importDefault(require("./templates/pokemon"));
const events_1 = __importDefault(require("./templates/events"));
const types_1 = __importDefault(require("./templates/types"));
exports.routes = {
    "/": {
        template: "/templates/pokedex.html",
        script: pokedex_1.default
    },
    "/events": {
        template: "/templates/events.html",
        script: events_1.default,
        resolve: async () => {
            const raids = await repo.getRaids();
            return raids;
        }
    },
    "/pokedex/:id": {
        template: "/templates/pokemon.html",
        script: pokemon_1.default,
        resolve: async (params) => {
            console.log("pokedex/:id");
            //might use later
            const main = document.querySelector("main");
            sessionStorage.setItem("scrollPosition", main.scrollTop.toString());
            const formID = params.id;
            console.log(formID);
            const pokemon = repo.getPokemonById(formID.toUpperCase());
            //fetch regional forms if available
            return pokemon;
        }
    },
    "/types": {
        template: "/templates/types.html",
        script: types_1.default,
        resolve: async () => {
            console.log("types");
            const types = await repo.getAllTypes();
            return {
                types: types
            };
        }
    },
    "/battle": {
        template: "/templates/battle.html",
        script: async () => {
            console.log("battle");
            sidebar.selectBattle();
        }
    },
    "404": {
        template: "/templates/404.html"
    }
};
class Router {
    routes;
    templates;
    params;
    routeData;
    constructor(routes) {
        this.routes = routes;
        this.params = {};
        this.routeData = {};
        this.templates = {};
        this.init().then(r => {
            //might need to do something here idk
        });
    }
    async init() {
        window.addEventListener('popstate', () => this.handleLocation());
        document.addEventListener('click', this.handleLinkClick.bind(this));
        await this.preloadTemplates();
        await this.handleLocation();
        console.log("[Router] Init");
        return;
    }
    async preloadTemplates() {
        const templatePaths = Object.values(this.routes).map(route => route.template);
        const uniqueTemplatePaths = Array.from(new Set(templatePaths));
        await Promise.all(uniqueTemplatePaths.map(async (path) => {
            this.templates[path] = await fetch(path).then((data) => data.text());
        }));
    }
    addRoute(path, config) {
        this.routes[path] = config;
    }
    matchRoute(path) {
        for (let routePath of Object.keys(this.routes)) {
            const paramNames = [];
            const regexPath = routePath.replace(/:[^\s/]+/g, (match) => {
                paramNames.push(match.slice(1));
                return "([^/]+)";
            });
            const regex = new RegExp(`^${regexPath}$`);
            console.log(`Matching path: ${path} against regex: ${regex}`);
            const match = path.match(regex);
            if (match) {
                this.params = {};
                match.slice(1).forEach((value, index) => {
                    this.params[paramNames[index]] = value;
                });
                console.log(`Matched route: ${routePath} with params:`, this.params);
                return this.routes[routePath];
            }
        }
        console.log(`No match found for path: ${path}`);
        return this.routes["404"] || null;
    }
    async handleLocation() {
        const path = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        const route = this.matchRoute(path);
        if (!route) {
            this.load404();
            return;
        }
        const queryParams = {};
        searchParams.forEach((value, key) => {
            queryParams[key] = value;
        });
        //queryParams go into routeData
        this.routeData.queryParams = queryParams;
        //run prefetch if specified
        if (route.resolve) {
            try {
                const resolvedData = await route.resolve(this.params);
                this.routeData = { ...this.routeData, ...resolvedData };
            }
            catch (error) {
                console.error("Error resolving data for route:", path, error);
                this.load404();
                return;
            }
        }
        //progressive view transition
        if (document.startViewTransition) {
            document.startViewTransition(async () => {
                await this.loadContent(route);
            });
        }
        else {
            await this.loadContent(route);
        }
    }
    async loadContent(route) {
        //loading from template in memory
        const html = this.templates[route.template];
        const mainElement = document.querySelector("main");
        if (mainElement) {
            mainElement.innerHTML = html;
        }
        //script after dom content loaded
        if (route.script) {
            route.script(this.params, this.routeData);
        }
        if (this.params.id) {
            this.displayPokemonDetails(this.params.id);
        }
    }
    async navigateTo(path) {
        window.history.pushState({}, "", path);
        await this.handleLocation();
    }
    static async updateQueryParams(queryParams) {
        const windowHasQueryParams = window.location.search.length > 0;
        //no query params is treated as a reset, pushed to history
        if (!queryParams) {
            if (windowHasQueryParams) {
                const path = window.location.pathname;
                console.log("pushState", path);
                window.history.pushState({}, "", path);
            }
            else {
                //unless already reset then do nothing to avoid duplicates
                return;
            }
        }
        const searchParams = new URLSearchParams();
        for (let key in queryParams) {
            searchParams.set(key, queryParams[key]);
        }
        //if requesting identical query params, do nothing to avoid duplicates
        if (window.location.search === searchParams.toString()) {
            return;
        }
        //if the window doesnt have any query params already, we push the state, otherwise replace to keep history clean
        const path = window.location.pathname + "?" + searchParams.toString();
        if (windowHasQueryParams) {
            console.log("replaceState", path);
            window.history.replaceState({}, "", path);
        }
        else {
            console.log("pushState", path);
            window.history.pushState({}, "", path);
        }
    }
    load404() {
        const mainElement = document.querySelector("main");
        if (mainElement) {
            mainElement.innerHTML = "<h1>404 - Not Found</h1>";
        }
    }
    displayPokemonDetails(pokemonID) {
        console.log("Displaying details for Pokémon ID:", pokemonID);
    }
    handleLinkClick(event) {
        let target = event.target;
        //crazy way to find if we are actually inside a link but just clicking on a child element
        while (target && target.tagName !== 'A') {
            target = target.parentElement;
        }
        if (target && target.tagName === 'A' && target.getAttribute('href')) {
            event.preventDefault();
            const path = target.getAttribute('href');
            if (path) {
                this.navigateTo(path).then(r => {
                    //might need to do something here idk
                });
            }
        }
    }
}
exports.Router = Router;
//# sourceMappingURL=router.js.map