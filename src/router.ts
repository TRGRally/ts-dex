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
            const formID = params.id;
            console.log(formID);
            const pokemon = repo.getPokemonById(formID.toUpperCase());
            //fetch regional forms if available

            return pokemon;
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
    private params: { [key: string]: string };
    private routeData: any;
    private templates: { [key: string]: string };

    constructor(routes: { [key: string]: Route }) {
        this.routes = routes;
        this.params = {};
        this.routeData = {};
        this.templates = {};
        this.init();
    }

    private async init(): Promise<void> {
        window.addEventListener('popstate', () => this.handleLocation());
        document.addEventListener('click', this.handleLinkClick.bind(this));
        await this.preloadTemplates();
        await this.handleLocation();
        console.log("[Router] Init");
    }

    private async preloadTemplates(): Promise<void> {
        const templatePaths = Object.values(this.routes).map(route => route.template);
        const uniqueTemplatePaths = Array.from(new Set(templatePaths));

        await Promise.all(uniqueTemplatePaths.map(async (path) => {
            const html = await fetch(path).then((data) => data.text());
            this.templates[path] = html;
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
        const route = this.matchRoute(path);

        if (!route) {
            this.load404();
            return;
        }

        //run prefetch if specified
        if (route.resolve) {
            try {
                this.routeData = await route.resolve(this.params);
            } catch (error) {
                console.error("Error resolving data for route:", path, error);
                this.load404();
                return;
            }
        }

        //pregressive view transition
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
                this.navigateTo(path);
            }
        }
    }
}





