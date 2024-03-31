export interface gameObjectFE {
    id: string;
    home_team: string;
    away_team: string;
    home_points: number | string;
    away_points: number | string;
    commence_time: number; //in unix so smart contract conversion is easier
}

export interface GameResultFE {
    id: string;
    home_team: string;
    away_team: string;
    home_score: number;
    away_score: number;
    commence_time: number;
    completed: boolean;
}

export interface GamesForTable {
    id: string;
    home_team: string;
    away_team: string;
    home_points?: number | string;
    away_points?: number | string;
    home_score?: number;
    away_score?: number;
    betsLength?: number;
    gameResultHash?: string;
    commence_time: number; //in unix so smart contract conversion is easier
}
export {};
