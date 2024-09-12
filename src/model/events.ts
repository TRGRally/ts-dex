import { Pokemon } from "./pokemon";

enum RaidTier {
    One = "RAID_LEVEL_1",
    Two = "RAID_LEVEL_2",
    Three = "RAID_LEVEL_3",
    Mega = "RAID_LEVEL_MEGA",
    Five = "RAID_LEVEL_5",
    MegaFive = "RAID_LEVEL_MEGA_5",
    UltraBeast = "RAID_LEVEL_ULTRA_BEAST",
    Elite = "RAID_LEVEL_ELITE",
    Six = "RAID_LEVEL_6",
    Unset = "RAID_LEVEL_UNSET"
}

export type Raid = {
    pokemon: Pokemon;
    shiny: boolean;
    tier: RaidTier;
    startDate: number;
    endDate: number;
    activeDate: number;
}