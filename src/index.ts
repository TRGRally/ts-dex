import * as repo from "./util/repository";
import * as router from "./router";
import { Router } from "./router";

async function main() {
    //await repo.initDB();
    let dbEmpty = await repo.isDBEmpty();
    console.log("empty", dbEmpty);
    console.log("stale", repo.isDBStale());

    if (dbEmpty || repo.isDBStale()) {
        console.warn("DB is empty or stale, refreshing...");
        await repo.initDB();
        console.log("DB refreshed");
        window.location.reload();
    } else {
        repo.getAllPokemon(1, 1400).then((pokemon) => {
            console.log(pokemon);
        });

        repo.getPokemonByRegion(repo.Region.Galar, 1, 1000).then((types) => {
            console.log(types);
        });
    }


    //beg browser to listen for storage persist
    if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        console.log(`Persisted storage granted: ${isPersisted}`);
    }

    document.addEventListener('click', function(event) {
        if ((event.target as HTMLElement).classList.contains('toggle')) {
            console.log(event.target);
            (event.target as HTMLElement).classList.toggle("active");
        }
    });

    const cientRouter = new router.Router(router.routes);
    
}

//top level await moment
main().catch(console.error);

