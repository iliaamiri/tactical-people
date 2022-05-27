const {makeId, makeGuestId} = require("../../core/utils");
const AmmoInventory = require("./AmmoInventory");
const Life = require("./Life");
const {Players} = require("../repos/Players");

const Pigeon = require("./Pigeon");
const PigeonType = require("./PigeonType");

const database = require("../../databaseAccessLayer");

const Player = {
  playerId: null, // int (db primary key auto increment)
  username: null, // string
  password: null, // string (confidential sensitive data)

  ammoInventory: null, //$ref: AmmoInventory

  socketId: null, // socket.io Id. Changes for each socket connection.

  currentPigeon: null, //$ref: Pigeon

  disconnectDetectionSetTimoutId: null,
  disconnectDetectionWhileTransitioningBetweenPages_SetTimeoutId: null,

  currentGameIdPlaying: null, // current gameId where user is playing in.

  life: null, // $ref: Life

  initNewGuestPlayer() {
    let newGuestId = makeGuestId();
    this.username = newGuestId;
    this.initOnlinePlayer(newGuestId, newGuestId);
  },

  initNewPlayer(username) {
    let newPlayerId = makeId();
    this.initOnlinePlayer(newPlayerId, username);
  },

  initOnlinePlayer(playerId, username) {
    this.playerId = playerId;
    this.username = username;
  },

  initForNewGame(game) {
    // Allocate both players their ongoing game id to make sure they won't play another game simultaneously.
    this.currentGameIdPlaying = game.gameId;

    // Initiate the players' initial ammo and lives.
    this.ammoInventory = Object.create(AmmoInventory);
    this.ammoInventory.init(game.gameId, this.playerId);

    this.life = Object.create(Life);
    this.life.init(game.gameId, this.playerId);
  },

  reSyncInRepo() {
    Players.updateActivePlayer(this.playerId, this);
  },

  reSyncInDatabase() {
    Players.updateInDatabase(this.playerId, this);
  },

  isOnline() {
    return !!(this.socketId);
  },

  isTracked() {
    return Players.isTracked(this.playerId);
  },

  cleanUpAfterGame() {
    this.currentGameIdPlaying = null;
    this.life = null;
    this.ammoInventory = null;
  },

  async getPigeons() {
    const myPigeons = await database.playerPigeonEntity.getPigeons(this.playerId);
    if (!myPigeons) {
      return null;
    }

    const pigeonsResult = [];
    for (let pigeonRow of myPigeons) {
      const pigeon = Object.create(Pigeon);
      pigeon.initExistingPigeon(pigeonRow.pigeon_id, pigeonRow.pigeon_type_id, pigeonRow.hue_angle);
      const pigeonType = Object.create(PigeonType);
      pigeonType.initExistingPigeonType(pigeonRow.pigeon_type_id, pigeonRow.name, pigeonRow.asset_folder_path);
      pigeon.pigeonType = pigeonType;
      pigeonsResult.push(pigeon);
    }

    return pigeonsResult;
  },

  toJSON() {
    return {
      playerId: this.playerId,
      username: this.username,
      ammoInventory: this.ammoInventory,
      life: this.life,
    };
  },
};

module.exports = Player;