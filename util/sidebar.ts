const navLinks = document.getElementsByClassName('nav-link'); //live HTMLCollection

export function selectPokedex(): void {
    deselectAllNavLinks();
    document.getElementById('pokedex-nav').classList.add('active');
}

export function selectEvents(): void  {
    deselectAllNavLinks();
    document.getElementById('events-nav').classList.add('active');
}

function deselectAllNavLinks(): void  {
    for (let i = 0; i < navLinks.length; i++) {
        navLinks[i].classList.remove('active');
    }
}