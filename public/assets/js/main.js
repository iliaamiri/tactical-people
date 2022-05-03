import MovePlaceholder from './classes/MovePlaceholder.js';
import Inventory from "./classes/Inventory.js";
import Life from './classes/Life.js';

// Helpers
import Players from "./helpers/Players.js";
import Player from "./helpers/Player.js";
import BotPlayer from "./helpers/BotPlayer.js";
import RoundMove from "./helpers/RoundMove.js";

// Initiating the players.
Players.all.player1 = new Player("AklBm4", "Me");
Players.all.player2 = new BotPlayer();

let currentSelectedInventory;

const gameResultEnum = ['loss', 'win', 'draw'];

function singleCompare(move1, move2) {
    if (move1 === 'attack' && move2 === 'none') {
        return 1;
    } else if (move1 === 'none' && move2 === 'attack') {
        return 2;
    } else {
        return 0;
    }
}

function tripletCompare(moves) {
    let ones = moves.filter(number => number === 1).length;
    let twos = moves.filter(number => number === 2).length;

    if (ones > twos) {
        return 1;
    } else if (ones < twos) {
        return 2;
    } else {
        return 0;
    }
}

document.querySelector('body').addEventListener('click', async event => {
    event.preventDefault();
});

document.querySelector('div.done').addEventListener('click', async event => {
    // Generating the Bot player's moves.
    const opponentMove = Players.all.player2.generateRandomMoves();

    console.log("HERE")
    let myTallyFirstColumn = document.querySelectorAll('table.tally.my-tally td:first-child');

    console.log('my', myTallyFirstColumn);

    myTallyFirstColumn.forEach((td, index) => {
        let moveComponent = Object.values(Players.all.player1.moves.toJSON())[index];
        if (moveComponent === 'attack') {
            td.classList.add('cell-attacked');
        } else if (moveComponent === 'block') {
            td.classList.add('cell-blocked');
        }

    });

    let opponentTallyFirstColumn = document.querySelectorAll('table.tally.opponent-tally td:first-child');
    console.log('opponent', opponentTallyFirstColumn);
    opponentTallyFirstColumn.forEach((td, index) => {
        let moveComponent = Object.values(opponentMove)[index];
        if (moveComponent === 'attack') {
            td.classList.add('cell-attacked');
        } else if (moveComponent === 'block') {
            td.classList.add('cell-blocked');
        }

    });

    let playerMoves = [];
    for (let index = 0; index < 3; index++) {
        let myMoveComponent = Object.values(Players.all.player1.moves.toJSON())[index];
        let opponentMoveComponent = Object.values(opponentMove)[index];
        playerMoves.push(singleCompare(myMoveComponent, opponentMoveComponent));
    }

    console.log('playermoves', playerMoves);

    let roundResult = tripletCompare(playerMoves);
    if (roundResult === 1) {
        myTallyFirstColumn.forEach(td => {
            td.classList.add('round-won');
        });
        opponentTallyFirstColumn.forEach(td => {
            td.classList.add('round-defeat');
        });
        Life.all.opponentLife.decreaseCounter();
    } else if (roundResult === 2) {
        myTallyFirstColumn.forEach(td => {
            td.classList.add('round-defeat');
        });
        opponentTallyFirstColumn.forEach(td => {
            td.classList.add('round-won');
        });
        Life.all.myLife.decreaseCounter();
    } else {
        myTallyFirstColumn.forEach(td => {
            td.classList.add('round-draw');
        });
        opponentTallyFirstColumn.forEach(td => {
            td.classList.add('round-draw');
        });
    }

    document.querySelectorAll('.show-animation').forEach(element => {
        console.log('element', element);
        element.classList.add('hide-animation');
        element.classList.remove('show-animation');
    });

    let pigeon = document.querySelector('div.pigeons-container img.pigeon-left.picking-move-animation');
    pigeon.classList.add('revert-pigeon-pick-move');
    pigeon.classList.remove('picking-move-animation');
});

document.querySelector('img.my-shield').addEventListener('click', async event => {
    console.log('shield success!');
    RoundMove.selectedMoveType = 'block';
    const myBlockCounter = document.querySelector('span.my-block-counter');
    currentSelectedInventory = Inventory.all['myBlock'];
});

document.querySelector('img.my-attack').addEventListener('click', async event => {
    console.log('sword success!');
    RoundMove.selectedMoveType = 'attack';
    const myAttackCounter = document.querySelector('span.my-attack-counter');
    currentSelectedInventory = Inventory.all['myAttack'];
});

document.querySelector('div.moves-placeholder').addEventListener('click', async event => {
    let target = event.target;
    console.log('selectedMoveType', RoundMove.selectedMoveType);
    if (target.tagName === 'DIV' && RoundMove.selectedMoveType && target.classList.contains('mv-placeholder')) {
        let bodyPartType;
        if (target.classList.contains('head')) {
            console.log('hitting head');
            bodyPartType = 'head';

        } else if (target.classList.contains('body')) {
            console.log('hitting body');
            bodyPartType = 'body';

        } else if (target.classList.contains('legs')) {
            console.log('hitting legs');
            bodyPartType = 'legs';
        }

        let currentMovePlaceholder = MovePlaceholder.all[bodyPartType];
        if (currentMovePlaceholder) {
            currentMovePlaceholder.bodyPartType = bodyPartType;
            currentMovePlaceholder.moveType = RoundMove.selectedMoveType;
            currentMovePlaceholder.target = target;
        } else {
            MovePlaceholder.all[bodyPartType] = new MovePlaceholder(bodyPartType, RoundMove.selectedMoveType, target);
            currentMovePlaceholder = MovePlaceholder.all[bodyPartType];
        }

        currentMovePlaceholder.check();
        console.log(currentMovePlaceholder);
        console.log('my moves object', Players.all.player1.moves);
    }
});

/* 
    gameId: timestamp???
    Ready!
    read move info from DOM
    in memory
    
    give player time to wait before round starts

    
*/

