"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectPokedex = selectPokedex;
exports.selectEvents = selectEvents;
const navLinkSelector = '.nav-item';
function selectPokedex() {
    deselectAllNavLinks();
    const pokedexNav = document.getElementById('pokedex-nav');
    if (pokedexNav) {
        pokedexNav.classList.add('active');
    }
}
function selectEvents() {
    deselectAllNavLinks();
    const eventsNav = document.getElementById('events-nav');
    if (eventsNav) {
        eventsNav.classList.add('active');
    }
}
function deselectAllNavLinks() {
    const navLinks = document.querySelectorAll(navLinkSelector);
    if (navLinks.length > 0) {
        navLinks.forEach((link) => {
            link.classList.remove('active');
        });
    }
    else {
        console.error("No nav links found with selector:", navLinkSelector);
    }
}
//# sourceMappingURL=sidebar.js.map