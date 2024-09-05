import { RaidCard } from '../elements.js';
import * as repo from '../util/repository.js';
import * as sidebar from '../util/sidebar.js';


export default function initEvents(
    params: { 
        [key: string]: string 
    }, 
    routeData: { 
        [key: string]: string 
    }
): void {
    console.log("events");
    sidebar.selectEvents();

    const raidsContainer = document.querySelector(".raids") as HTMLElement;
    const raids = routeData as unknown as Raid[];

    raids.forEach((raid) => {
        const raidCard = RaidCard(raid);
        raidsContainer.appendChild(raidCard);
    });

    

}
