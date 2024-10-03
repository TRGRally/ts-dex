import * as repo from "./util/repository";
import * as router from "./router";
import { Router } from "./router";

async function main() {
    const loading = document.getElementById('db-loading');

    //await repo.initDB();
    let dbEmpty = await repo.isDBEmpty();
    console.log("empty", dbEmpty);
    console.log("stale", repo.isDBStale());

    if (dbEmpty || repo.isDBStale()) {
        console.warn("DB is empty or stale, refreshing...");
        if (loading) {
            loading.style.display = 'flex';
        }
        await repo.initDB();
        console.log("DB refreshed");
        
        //lol
        // setTimeout(() => {
        //     window.location.reload();
        // }, 1000);

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

    //image preloading
    const imagePaths = [
        repo.getTypeBackground("Normal"),
        repo.getTypeBackground("Fire"),
        repo.getTypeBackground("Water"),
        repo.getTypeBackground("Electric"),
        repo.getTypeBackground("Grass"),
        repo.getTypeBackground("Ice"),
        repo.getTypeBackground("Fighting"),
        repo.getTypeBackground("Poison"),
        repo.getTypeBackground("Ground"),
        repo.getTypeBackground("Flying"),
        repo.getTypeBackground("Psychic"),
        repo.getTypeBackground("Bug"),
        repo.getTypeBackground("Rock"),
        repo.getTypeBackground("Ghost"),
        repo.getTypeBackground("Dragon"),
        repo.getTypeBackground("Dark"),
        repo.getTypeBackground("Steel"),
        repo.getTypeBackground("Fairy"),
    ];
    
    const preloadDiv = document.createElement('div');
    preloadDiv.style.position = 'absolute';
    preloadDiv.style.width = '0';
    preloadDiv.style.height = '0';
    preloadDiv.style.overflow = 'hidden';
    
    imagePaths.forEach((path) => {
        const imgDiv = document.createElement('div');
        imgDiv.style.backgroundImage = `url(${path})`;
        imgDiv.style.width = '0';
        imgDiv.style.height = '0';
        preloadDiv.appendChild(imgDiv);
    });
    
    document.body.appendChild(preloadDiv);
    
}

//top level await moment
main().catch(console.error);

