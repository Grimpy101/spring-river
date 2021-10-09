import PlayerInteraction from "./Player.js";
export default class Interactions {
    constructor(player) {
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
//# sourceMappingURL=Interactions.js.map