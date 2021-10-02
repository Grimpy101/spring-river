import Texture from "./Texture.js";

export default class Material {

    name: string;
    doubleSided: boolean;

    baseColorTexture: Texture;
    normalTexture: Texture;
    metallicRoughnessTexture: Texture;
    metallicFactor: number;
    roughnessFactor: number;
}