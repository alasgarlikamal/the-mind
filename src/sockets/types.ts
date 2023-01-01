export type Room = {
    id: string;
    admin: string;
    joinedPlayers: string[];
    readyPlayers: string[];
}

export type Game = {
    id: string;
    roomId: string;
    levelCount: number;
    currentLevel: number;
    lives: number;
    throwingStarCount: number;
    throwingStarVote: number;
    smallestCard: number;
}

export type Player = {
    id: string;
    roomId: string;
    gameId: string;
    currentCards: number[];
    done: boolean;
    points: number;
}