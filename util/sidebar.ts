const navLinkSelector = '.nav-item';

export function selectPokedex(): void {
    deselectAllNavLinks();
    const pokedexNav = document.getElementById('pokedex-nav');
    if (pokedexNav) {
        pokedexNav.classList.add('active');
    }
}

export function selectEvents(): void {
    deselectAllNavLinks();
    const eventsNav = document.getElementById('events-nav');
    if (eventsNav) {
        eventsNav.classList.add('active');
    }
}

function deselectAllNavLinks(): void {
    const navLinks = document.querySelectorAll(navLinkSelector);
    if (navLinks.length > 0) {
        navLinks.forEach((link) => {
            link.classList.remove('active');
        });
    } else {
        console.error("No nav links found with selector:", navLinkSelector);
    }
}