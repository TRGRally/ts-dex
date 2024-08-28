import * as repo from "./util/repository.js";


let dbEmpty = await repo.isDBEmpty();
console.log("empty", dbEmpty);
    console.log("stale", repo.isDBStale());
if (dbEmpty || repo.isDBStale()) {
    console.warn("DB is empty or stale, refreshing...");
    await repo.initDB();
}

//beg browser to listen for storage persist
if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    console.log(`Persisted storage granted: ${isPersisted}`);
}

// repo.getAllPokemon().then((pokemon) => {
//     console.log(pokemon);
// });


document.addEventListener('click', function(event) {
    if ((event.target as HTMLElement).classList.contains('toggle')) {
        console.log(event.target);
        (event.target as HTMLElement).classList.toggle("active");
    }
});


