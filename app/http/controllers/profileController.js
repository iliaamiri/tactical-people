const database = require("../../../databaseAccessLayer");

const ProfileException = require("../../../core/Exceptions/ProfileExceptions");
const {init: playerPigeonEntity} = require("../../../databaseAccessLayer/entities/playerPigeon");

const Tokens = include("app/repos/Tokens");

const ProfileController = {
  async getUserData(req, res) {
    console.log(req.user)

    res.json({
      email: req.user.email,
      username: req.user.username,
      games_played: req.user.gamesPlayed,
      games_won: req.user.gamesWon,
      games_lost: req.user.gamesLost
    });
  },

  async updatePigeonCustomization(req, res) {
    const {myPigeons} = req.body;
    console.log("myPigeons", myPigeons); // debug
    if (!myPigeons || !Array.isArray(myPigeons) || myPigeons.length < 1) {
      throw ProfileException.badInput;
    }

    try {
      for (let pigeon of myPigeons) {
        if (!pigeon.hasOwnProperty('hueAngle') || !pigeon.hasOwnProperty('isSelected') || !pigeon.pigeonId) {
          throw ProfileException.badInput;
        }

        if (pigeon.isSelected) {
          await req.user.updateSelectedPigeon(pigeon.pigeonId);
        }

        if (pigeon.hueAngle < 0 || pigeon.hueAngle > 100) {
          throw ProfileException.badInput;
        }

        await database.playerPigeonEntity.updatePlayerPigeonHue(req.user.playerId, pigeon.pigeonId, pigeon.hueAngle);
      }

      res.json({
        status: true
      });
    } catch (err) {
      console.log(err)
      throw err;
    }

  },
}

module.exports = ProfileController;