import Node from "../data/Node.js";
import PlayerInteraction from "./Player.js";

export default class Interactions {

    player: Node;
    playerInteraction: PlayerInteraction;
    enabled: boolean;


    constructor(player: Node) {
        this.player = player;
        this.playerInteraction = new PlayerInteraction(player);
    }

    enable() {
        this.playerInteraction.enable();
        this.enabled = true;
    }

    disable() {
        this.playerInteraction.disable();
        this.enabled = false;
    }

    step(dt: number) {
        this.playerInteraction.moveOnKeyAction(dt);
        this.player.updateMatrix();
    }
}