import PlayerInteraction from "./Player.js";
export default class Interactions {
    constructor(player) {
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
    step(dt) {
        this.playerInteraction.moveOnKeyAction(dt);
        this.player.updateMatrix();
    }
}
//# sourceMappingURL=Interactions.js.map