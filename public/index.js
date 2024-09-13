"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const repo = __importStar(require("./util/repository"));
const router = __importStar(require("./router"));
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
    }
    else {
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
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('toggle')) {
            console.log(event.target);
            event.target.classList.toggle("active");
        }
    });
    const cientRouter = new router.Router(router.routes);
}
//top level await moment
main().catch(console.error);
//# sourceMappingURL=index.js.map