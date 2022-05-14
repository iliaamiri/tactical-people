const EventEmitter = require('events');
const playerEmitter = new EventEmitter();

const makeId = require('../../core/utils').makeId;
const Games = require("./Games");
const Game = require("../models/Game");
const AmmoInventory = require("../models/AmmoInventory");
//const Round = require('../models/Round');
const Life = require('../models/Life');

const {Mutex} = require("async-mutex");

/* playerEmitter.on('addPlayer', function(player) {
  //console.log('adding player', player);
  Players.addToMatchQueue(player);
}); */

/**
 * Event listener <matchReady>: Receiving an array of two playerId's, this event will initiate a new game, and passes the
 * new game instance as a payload to the Event<gameReady>.
 *
 * This event will be emitted once the server realizes that there are more than two players in the queue.
 */
playerEmitter.on('matchReady', function (playersIdsArr) {
  // Get the player objects from playerIds.
  let playersArr = playersIdsArr.map(playerId => Players.find(playerId));

  console.log('two players are ready to be matched:', playersArr); // debug 🪲

  // Create new game instance and initiate it.
  const game = Object.create(Game);
  game.initNewGame(playersArr);

  console.log('game newly created and Initiated', JSON.parse(JSON.stringify(game)), "playersArr: ", playersArr);

  // Initiate the players' inventories and lives for a new game.
  playersArr.forEach(player => {
    // Initiate the players for a new game (prepare them for a new game).
    player.initForNewGame(game);
  });

  // Add the game instance to the Games collection.
  Games.add(game);

  console.log('Games.all', Games.showAll()); // debug

  // Signal `gameReady` Event and pass the game instance to the socket handler.
  playerEmitter.emit('gameReady', game);
});

const Players = {
  playerEmitter: playerEmitter, // playerEmitter Event
  all: {
    //  "<playerId":  $ref Player
  },

  matchQueue: [],// The match queue array

  addToMatchQueue: function (player) {
    console.log('adding player to match queue', player);
    this.matchQueue.push(player.playerId);
    //console.log('match queue length', this.matchQueue.length);
    const mutex = new Mutex();
    mutex
      .runExclusive(() => {
        if (this.matchQueue.length >= 2) {
          console.log('match queue', this.matchQueue); // debug
          playerEmitter.emit('matchReady', this.pickTwoRandomPlayersFromQueue());

          console.log("Match Queue updated: ", this.matchQueue); // debug
        }
      })
      .then(() => {
        console.log("Mutex Unlocked.. Username: ", player.username);
        console.log("Match Queue after Mutex Unlocked: ", this.matchQueue);
      });
    // if (this.matchQueue.length === 2) {
    //   // console.log('match queue', this.matchQueue);
    //   //playerEmitter.emit('matchReady', this.pickTwoRandomPlayersFromQueue());
    //   playerEmitter.emit('matchReady', this.matchQueue);
    //   this.matchQueue = [];
    // }
  },

  /**
   * Add a new player to the collection.
   * @param player: Player
   */
  add: function (player) {
    this.all[player.playerId] = player;
    // playerEmitter.emit('addPlayer', player);
  },

  /**
   * Delete a player by their playerId
   * @param id
   */
  delete: function (id) {
    delete this.all[id];
  },

  /**
   * Find a player by their playerId
   * @param id
   * @returns {*|null}
   */
  find: function (id) {
    return this.all[id] || null;
  },

  /**
   * Find a player by their username.
   * @param username
   * @returns {unknown}
   */
  findByUsername(username) {
    return Object.values(this.all).find(player => player.username === username) || null;
  },

  /**
   * Pick two random players from the match queue. This method functions similar to a lottery machine. It randomly picks
   * a ball (playerId) and removes the picked item from the collection.
   * @returns {null|*[]}
   */
  pickTwoRandomPlayersFromQueue() {
    if (this.matchQueue.length < 2)
      return null;

    let player1_index = Math.floor(Math.random() * this.matchQueue.length);
    let player1 = this.matchQueue[player1_index];

    this.matchQueue.splice(player1_index, 1);

    let player2_index = Math.floor(Math.random() * this.matchQueue.length);
    let player2 = this.matchQueue[player2_index];

    this.matchQueue.splice(player2_index, 1);

    return [player1, player2];
  }
};

module.exports = {Players, playerEmitter};
