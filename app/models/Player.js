const {makeId, makeGuestId} = require("../../core/utils");
const AmmoInventory = require("./AmmoInventory");
const Life = require("./Life");
const {Players} = require("../repos/Players");

const Pigeon = require("./Pigeon");

const database = require("../../databaseAccessLayer");

const Player = {
  playerId: null, // int (db primary key auto increment)
  username: null, // string
  email: null, // string
  password: null, // string (confidential sensitive data)

  ammoInventory: null, //$ref: AmmoInventory

  socketId: null, // socket.io Id. Changes for each socket connection.

  currentPigeon: null, //$ref: Pigeon

  disconnectDetectionSetTimoutId: null,
  disconnectDetectionWhileTransitioningBetweenPages_SetTimeoutId: null,

  currentGameIdPlaying: null, // current gameId where user is playing in.

  gamesPlayed: null,
  gamesWon: null,
  gamesLost: null,

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

  initOnlinePlayer(playerId, username, email, gamesPlayed, gamesWon, gamesLost) {
    this.playerId = playerId;
    this.username = username;
    this.email = email;
    this.gamesPlayed = gamesPlayed;
    this.gamesWon = gamesWon;
    this.gamesLost = gamesLost;
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
      pigeon.initExistingPigeon(pigeonRow.pigeon_id, pigeonRow.name, pigeonRow.asset_folder_path);
      pigeon.setHueAngle(pigeonRow.hue_angle);
      pigeonsResult.push(pigeon);
    }

    return pigeonsResult;
  },

  async fetchSelectedPigeon() {
    if (this.currentPigeon) {
      return this.currentPigeon;
    }
    const selectedPigeon = await database.playerEntity.getSelectedPigeon(this.playerId);
    if (!selectedPigeon) {
      return null;
    }

    this.currentPigeon = Object.create(Pigeon);
    this.currentPigeon.initExistingPigeon(selectedPigeon.pigeon_id, selectedPigeon.name, selectedPigeon.asset_folder_path);
    this.currentPigeon.setHueAngle(selectedPigeon.hue_angle);

    return this.currentPigeon;
  },

  async updateSelectedPigeon(pigeonId) {
    if (this.currentPigeon.pigeonId === pigeonId) {
      return;
    }

    await database.playerEntity.updateSelectedPigeon(this.playerId, pigeonId);
    this.currentPigeon = database.playerEntity.getSelectedPigeon(this.playerId);
  },

  async countUnlockedPigeons() {
    const numberOfUnlockedPigeons = await database.playerPigeonEntity.countPlayerPigeons(this.playerId);
    const numberOfAllPigeons = await database.pigeonEntity.countAll();
    return numberOfAllPigeons - numberOfUnlockedPigeons;
  },

  toJSON() {
    return {
      playerId: this.playerId,
      username: this.username,
      ammoInventory: this.ammoInventory,
      life: this.life,
      selectedPigeon: this.selectedPigeon?.toJSON(),
    };
  },
};

module.exports = Player;