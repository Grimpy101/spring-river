import Camera from "./Camera.js";
import Light from "./Light.js";
import Mesh from "./Mesh.js";

export default class Node {

    name: string | null;

    translation: number[];
    rotation: number[];
    scale: number[];

    children: Node[];

    mesh: Mesh;
    camera: Camera;
    light: Light;
}