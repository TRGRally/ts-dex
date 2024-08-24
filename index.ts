import * as repo from "./util/repository.js";

console.log(repo.allPokemonMap);

repo.initDB(repo.allPokemonMap);

repo.getAllPokemon().then((pokemon) => {
    console.log(pokemon);
});


const container = document.getElementById('container');

repo.getAllPokemon().then((allPokemon) => {
    //order allPokemon by dexNr
    allPokemon.sort((a, b) => a.dexNr - b.dexNr);
    allPokemon.forEach((pokemon) => {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('card');
        pokemonCard.innerHTML = `
            <img src="${pokemon.imageUrl || ""}" />
            <h2>${pokemon.name}</h2>
            <p>#${pokemon.dexNr}</p>
        `;
        container.appendChild(pokemonCard);
    });
});
