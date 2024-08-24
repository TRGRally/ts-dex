import * as repo from "./util/repository.js";
//map of all pokemon by formid -> pokemon
//nidoran male and female have the same formid but belonging to a different pokemon id. 
//this is the only non-unique formid across all pokemon ids.
//basically formid == uniqueid if you ignore nidoran. its irrelevant anyway.
const allPokemonMap = new Map();
repo.allPokemon.forEach((pokemon) => {
    allPokemonMap.set(pokemon.formId, pokemon);
});
console.log(allPokemonMap);
//# sourceMappingURL=index.js.map