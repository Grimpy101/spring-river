import Node from "../data/Node.js";
import PlayerInteraction from "./Player.js";

export default class Interactions {

    player: Node;
    playerInteraction: PlayerInteraction;


    constructor(player: Node) {
        this.player = player;
        this.playerInteraction = new PlayerInteraction(player);
    }

    enable() {
        this.playerInteraction.enable();
    }

    disable() {
        this.playerInteraction.disable();
    }
}