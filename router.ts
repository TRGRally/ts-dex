import * as repo from "./util/repository.js";
import * as sidebar from "./util/sidebar.js";

const routes = {
    "/": {
        template: "/templates/pokedex.html",
        script: (params, routeData) => {
            console.log("pokedex");
            sidebar.selectPokedex();

            const container = document.getElementById('container');

            repo.getAllPokemon().then((allPokemon) => {
                allPokemon.sort((a, b) => a.dexNr - b.dexNr);
                renderPokemon(allPokemon);
            });
            
            function renderPokemon(pokemonArray: Pokemon[]): void {

                container.innerHTML = "";
            
                pokemonArray.forEach((pokemon) => {
            
                    //
                    // I AM SORRY !
                    //
            
                    const isGenericForm = (pokemon.formId !== pokemon.id);
                    const regions = {
                        alola: pokemon.formId == ((pokemon.id).toString() + "_ALOLA"),
                        galarian: pokemon.formId == ((pokemon.id).toString() + "_GALARIAN"),
                        paldea: pokemon.formId == ((pokemon.id).toString() + "_PALDEA"),
                        hisuian: pokemon.formId == ((pokemon.id).toString() + "_HISUIAN")
                    }
            
                    let region: string = "";
                    let isRegional: boolean = false;
            
                    if (regions.alola) {
                        region = "Alola"
                        isRegional = true;
                    }
                    if (regions.galarian) {
                        region = "Galar"
                        isRegional = true;
                    }
                    if (regions.paldea) {
                        region = "Paldea"
                        isRegional = true;
                    }
                    if (regions.hisuian) {
                        region = "Hisui"
                        isRegional = true;
                    }
            
                    const isFunctionalForm = !isRegional && isGenericForm;
            
                    let regionAttribute = "";
                    let functionalAttribute = "";
            
                    if (isRegional) {
                        regionAttribute = `
                            <div class="attribute regional">
                                <span class="material-symbols-rounded">public</span>
                                <span class="text">${region}</span>
                            </div>
                        `;
                    }
            
                    if (isFunctionalForm) {
                        functionalAttribute = `
                            <div class="attribute functional">
                                <span class="material-symbols-rounded">category</span>
                            </div>
                        `;
                    }
            
                    let attributes: string = "";
                    if (isGenericForm) {
                        attributes = `
                            <div class="attributes">
                                ${regionAttribute}
                                ${functionalAttribute}
                            </div>
                        `
                    }
            
                    const pokemonCard = document.createElement('a');
                    pokemonCard.classList.add('card');
                    pokemonCard.innerHTML = `
                        <img draggable="false" src="${ pokemon.imageUrl || "https://cdn.discordapp.com/emojis/1276312604406710303.gif?size=44&quality=lossless" }" />
                        <div class="card-title"><span class="dexNr">#${pokemon.dexNr}</span> ${pokemon.name}</div>
                        ${attributes}
                    `;
            
                    pokemonCard.setAttribute('href', `/pokedex/${pokemon.formId.toLowerCase()}`);
            
                    pokemonCard.addEventListener("click", () => {
                        console.log(pokemon)
                    })
            
                    container.appendChild(pokemonCard);
                });
            }
            
            const dexSearchInput = document.getElementById("dex-search") as HTMLInputElement
            dexSearchInput.addEventListener("input", async (e) => {
                let result = await repo.searchPokemonByName(dexSearchInput.value)
                console.log(result)
                renderPokemon(result);
            });
        }
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
        script: (params, routeData) => {
            console.log("Pokémon detail page script");
            console.log("early resolved:", routeData);
            sidebar.selectPokedex();
            const title = document.querySelector(".pokemon-name") as HTMLElement;
            title.innerText = routeData.name;
        },
        resolve: async (params: { id: string }) => {
            const formID = params.id;
            console.log(formID);
            const response = repo.getPokemonById(formID.toUpperCase());
            return response;
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



