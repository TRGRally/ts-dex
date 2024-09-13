import { RaidCard } from '../elements';
import * as repo from '../util/repository';
import * as sidebar from '../util/sidebar';
import { Raid } from '../model/events';
import { BODY } from '../util/page-elements';


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
    BODY.style.backgroundImage = "unset";
    BODY.style.backgroundColor = "var(--bg0)";


    const raidsContainer = document.querySelector(".raids") as HTMLElement;
    const raids = routeData as unknown as Raid[];

    raids.forEach((raid) => {
        const raidCard = RaidCard(raid);
        raidsContainer.appendChild(raidCard);
    });

    

}
