const Round = require("./Round");

const Game = {
    rowId, // int (db primary key auto incrmn)
    gameId, // string
    winnerPlayerId, // int (ref to Player)

    players: {
        player1Id, // Int, ref to Players
        player2Id // Int, ref to Players
    },

    rounds: [
        // $ref: Round
    ],

    nextRound: function() {
        this.rounds.push(roundData);
    },

    toJSON: function() {
        return {
            rowId: this.rowId,
            gameId: this.gameId,
            winnerPlayerId: this.winnerPlayerId,
            players: this.players,
            rounds: this.rounds,
        };
    },
};

module.exports = Game;