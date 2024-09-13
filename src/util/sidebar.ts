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

export function selectTypes(): void {
    deselectAllNavLinks();
    const typesNav = document.getElementById('types-nav');
    if (typesNav) {
        typesNav.classList.add('active');
    }
}

export function selectBattle(): void {
    deselectAllNavLinks();
    const battleNav = document.getElementById('battle-nav');
    if (battleNav) {
        battleNav.classList.add('active');
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


