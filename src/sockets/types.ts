export type Room = {
    id: number;
    joinedPlayers: string[];
    readyPlayers: string[];
}

export type Game = {
    id: number;
    roomId: number;
    levelCount: number;
    currentLevel: number;
    lives: number;
    throwingStarCount: number;
    throwingStarVote: number;
    smallestCard: number;
}

export type Player = {
    id: number;
    roomId: number;
    gameId: number;
    currentCards: number[];
    done: boolean;
    points: number;
}