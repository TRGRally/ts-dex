import * as repo from "./util/repository.js";


if (repo.isDBEmpty() || repo.isDBStale()) {
    console.log("DB is empty or stale, refreshing...");
    await repo.initDB();
}

if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then((persistent) => {
      if (persistent) {
        console.log("Storage will not be cleared except by explicit user action");
      } else {
        console.log("Storage may be cleared by the UA under storage pressure.");
      }
    });
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


