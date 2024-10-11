import * as sidebar from '../util/sidebar';
import { BODY } from '../util/page-elements';
import { PokemonType } from '../model/type';
import { TypeCard } from '../elements';

export default function initTypes(
    params: { 
        [key: string]: string 
    },
    routeData: {
        [key: string]: any
    }
): void {
    console.log("types");
    sidebar.selectTypes();
    BODY.style.backgroundImage = "unset";
    BODY.style.backgroundColor = "var(--bg0)";
    console.log(routeData);
    const typesContainer = document.querySelector(".types-container") as HTMLElement;
    const types = routeData.types as PokemonType[];
    types.forEach((type) => {
        const typeCard = TypeCard(type);
        typesContainer.appendChild(typeCard);
    });

}
