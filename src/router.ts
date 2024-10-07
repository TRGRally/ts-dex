import * as repo from "./util/repository";
import * as sidebar from "./util/sidebar";
import initPokedex from "./templates/pokedex";
import initPokemon from "./templates/pokemon";
import initEvents from "./templates/events";

export const routes = {
    "/": {
        template: "/templates/pokedex.html",
        script: initPokedex
    },
    "/events": {
        template: "/templates/events.html",
        script: initEvents,
        resolve: async () => {
            const raids = await repo.getRaids();
            return raids;
        }

    },
    "/pokedex/:id": {
        template: "/templates/pokemon.html",
        script: initPokemon,
        resolve: async (params: { id: string }) => {
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
        script: async () => {
            console.log("types");
            sidebar.selectTypes();
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

export type Route = {
    template: string; //html file
    script?: (params: { [key: string]: string }, routeData: any) => void; //script.js equivalent
    resolve?: (params: { [key: string]: string }) => Promise<any> | any; //prefetch data
};


export class Router {
    private routes: { [key: string]: Route };
    private templates: { [key: string]: string };
    private params: { [key: string]: string };
    private routeData: any;

    constructor(routes: { [key: string]: Route }) {
        this.routes = routes;
        this.params = {};
        this.routeData = {};
        this.templates = {};
        this.init().then(r => {
            //might need to do something here idk
        });
    }

    private async init(): Promise<void> {
        window.addEventListener('popstate', () => this.handleLocation());
        document.addEventListener('click', this.handleLinkClick.bind(this));
        await this.preloadTemplates();
        await this.handleLocation();
        console.log("[Router] Init");
        return;
    }

    private async preloadTemplates(): Promise<void> {
        const templatePaths = Object.values(this.routes).map(route => route.template);
        const uniqueTemplatePaths = Array.from(new Set(templatePaths));

        await Promise.all(uniqueTemplatePaths.map(async (path) => {
            this.templates[path] = await fetch(path).then((data) => data.text());
        }));
    }

    public addRoute(path: string, config: Route): void {
        this.routes[path] = config;
    }

    private matchRoute(path: string): Route | null {
        for (let routePath of Object.keys(this.routes)) {
            const paramNames: string[] = [];
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

    public async handleLocation(): Promise<void> {
        const path = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        const route = this.matchRoute(path);

        if (!route) {
            this.load404();
            return;
        }

        const queryParams: { [key: string]: string } = {};
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
            } catch (error) {
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
        } else {
            await this.loadContent(route);
        }
    }

    private async loadContent(route: Route): Promise<void> {
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

    public async navigateTo(path: string): Promise<void> {
        window.history.pushState({}, "", path);
        await this.handleLocation();
    }

    public static async updateQueryParams(queryParams?: { [key: string]: string }): Promise<void> {

        const windowHasQueryParams = window.location.search.length > 0;
        
        //no query params is treated as a reset, pushed to history
        if (!queryParams) {
            if (windowHasQueryParams) {
                const path = window.location.pathname;
                console.log("pushState", path);
                window.history.pushState({}, "", path);
            } else {
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
        } else {
            console.log("pushState", path);
            window.history.pushState({}, "", path);
        }
    }

    private load404(): void {
        const mainElement = document.querySelector("main");
        if (mainElement) {
            mainElement.innerHTML = "<h1>404 - Not Found</h1>";
        }
    }

    private displayPokemonDetails(pokemonID: string): void {
        console.log("Displaying details for Pokémon ID:", pokemonID);
    }

    private handleLinkClick(event: MouseEvent): void {
        let target = event.target as HTMLElement;

        //crazy way to find if we are actually inside a link but just clicking on a child element
        while (target && target.tagName !== 'A') {
            target = target.parentElement as HTMLElement;
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





