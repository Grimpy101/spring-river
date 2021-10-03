export default class Camera {

    name: string;
    type: string;

    constructor(options: any) {
        this.name = options.name ? options.name : "Camera";
        this.type = options.type ? options.type : "unknown";
    }
}