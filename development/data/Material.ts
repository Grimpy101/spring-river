import Texture from "./Texture.js";

export default class Material {

    name: string;
    doubleSided: boolean;

    baseColorTexture: Texture;
    baceColorTexCoord: any;
    baseColorFactor: number[];

    metallicRoughnessTexture: Texture;
    metallicRoughnessTexCoord: any;
    metallicFactor: number;
    roughnessFactor: number;

    normalTexture: Texture;
    normalTexCoord: any;
    normalScale: number;

    occlusionTexture: Texture;
    occlusionTexCoord: any;
    strength: number;

    emissiveTexture: Texture;
    emissiveTexCoord: any;
    emissiveFactor: number[];
}