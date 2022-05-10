import Inventory from './Inventories/Inventory.js';
import RoundMove from "../helpers/RoundMove.js";
import Players from "../helpers/Players.js";

class MovePlaceholder {
    checked = false;

    // The placeholder body-type. It can be either of these three: `head`, `body`, `legs`.
    #bodyPartType;

    // The move type that the user selected. This value is 'none' by default. It will be changed later for every instance.
    #moveType = 'none';

    // The move the user placed on a particular placeholder. This value is 'none' by default and will be changed later.
    movePlaced = 'none';

    // The DOM element corresponding to either the `head`, `body`, or `legs` placeholders.
    target;

    constructor(bodyPartType) {
        // Here, at the very beginning of initializing this, we tell the instance to recognize the DOM element.
        this.target = document.querySelector(`div.mv-placeholder.${bodyPartType}`);
        this.bodyPartType = bodyPartType;
    }

    get bodyPartType() { return this.#bodyPartType; }
    set bodyPartType(newBodyPartType) {
        this.#bodyPartType = newBodyPartType;
        this.changeMove(this.movePlaced);
    }

    get moveType() { return this.#moveType; }
    set moveType(newMoveType) {
        if (RoundMove.moveTypeEnum.includes(newMoveType)) {
            this.#moveType = newMoveType;
        }
    }

    changeMove(newMove) {
        //console.log(Players.all.player1.moves)
        Players.all.player1.moves[this.bodyPartType] = newMove;
    }

    check() {
        //console.log('inventory.all from inside movePlaceholder', Inventory.all);
        if (this.moveType === 'none') {
            return;
        }

        this.checked = !this.checked;
        if (this.checked) {
            /* do stuff as if it's ON */
            //console.log('inventory all', Inventory.all);
            if (Inventory.all[`${this.moveType}-left`].counter === 0) { // if we have no inventory left, don't do place a move
                //console.log('inventory counter should be 0', Inventory.all[`${this.moveType}-left`].counter);
                this.checked = !this.checked;
                Players.all.player1.moves[this.bodyPartType] = 'none';
            } else {
                //console.log('left inventory counter', Inventory.all[`${this.moveType}-left`].counter);
                this.target.classList.add(`filled-${this.moveType}`);
                this.movePlaced = this.moveType;
                this.changeMove(this.movePlaced);
                Inventory.all[`${this.moveType}-left`].decreaseCounter();
            }
            
        } else {
            /* do stuff as if it's OFF */
            //console.log("ay?")
            //console.log('inventory all', Inventory.all);
            this.target.classList.remove(`filled-${RoundMove.moveTypeEnum[0]}`, `filled-${RoundMove.moveTypeEnum[1]}`);
            this.changeMove(null);
            if (this.movePlaced === 'attack') {
                Inventory.all['attack-left'].increaseCounter();
            } else if (this.movePlaced === 'block') {
                Inventory.all['block-left'].increaseCounter();
            }

            this.movePlaced = null;
        }
    }

    /**
     * Resets/Re-initialize every placeholder to make it ready for the next round.
     */
    static resetAll() {
        MovePlaceholder.all = {
            'head': new MovePlaceholder('head'),
            'body': new MovePlaceholder('body'),
            'legs': new MovePlaceholder('legs')
        }
    }

    static all = {
        /* 'head': new MovePlaceholder('head', null, null),
        'body': new MovePlaceholder('body', null, null),
        'legs': new MovePlaceholder('legs', null, null) */
    };
}

export default MovePlaceholder;