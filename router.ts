import * as repo from "./util/repository.js";
import * as sidebar from "./util/sidebar.js";
import initPokedex from "./templates/pokedex.js";
import initPokemon from "./templates/pokemon.js";

const routes = {
    "/": {
        template: "/templates/pokedex.html",
        script: initPokedex
    },
    "/events": {
        template: "/templates/events.html",
        script: (params, routeData) => {
            console.log("events");
            sidebar.selectEvents();
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

type Route = {
    template: string; //html file
    script?: (params: { [key: string]: string }, routeData: any) => void; //script.js equivalent
    resolve?: (params: { [key: string]: string }) => Promise<any> | any; //prefetch data
};


class Router {
    private routes: { [key: string]: Route };
    private params: { [key: string]: string };
    private routeData: any;

    constructor(routes: { [key: string]: Route }) {
        this.routes = routes;
        this.params = {};
        this.routeData = {};
        this.init();
    }

    private init(): void {
        window.addEventListener('popstate', () => this.handleLocation());
        this.handleLocation();
        console.log("[Router] Init");
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

        //prefetch if specified
        if (route.resolve) {
            try {
                this.routeData = await route.resolve(this.params);
            } catch (error) {
                console.error("Error resolving data for route:", path, error);
                this.load404();
                return;
            }
        }
        //loading dom content from template
        const html = await fetch(route.template).then((data) => data.text());
        document.querySelector("main")!.innerHTML = html;

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
        document.querySelector("main")!.innerHTML = "<h1>404 - Not Found</h1>";
    }

    private displayPokemonDetails(pokemonID: string): void {
        console.log("Displaying details for Pokémon ID:", pokemonID);
    }
}

const router = new Router(routes);
export default router;



