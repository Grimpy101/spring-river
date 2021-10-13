import { vec3 } from "../external_libraries/glMatrix/index.js";
import Texture from "./Texture.js";

export default class Material {

    name: string;
    doubleSided: boolean;
    alphaMode: string;
    alphaCutoff: number;

    baseColorTexture: Texture;
    baseColorTexCoord: any;
    baseColorFactor: any;

    metallicRoughnessTexture: Texture;
    metallicRoughnessTexCoord: any;
    metallicFactor: number;
    roughnessFactor: number;

    normalTexture: Texture;
    normalTexCoord: any;
    normalFactor: number;

    occlusionTexture: Texture;
    occlusionTexCoord: any;
    occlusionFactor: number;

    emissiveTexture: Texture;
    emissiveTexCoord: any;
    emissiveFactor: any;

    constructor(options: any = {}) {
        this.baseColorTexture = options.baseColorTexture || null;
        this.baseColorTexCoord = options.baseColorTexCoord || 0;
        this.baseColorFactor = options.baseColorFactor
            ? vec3.clone(options.baseColorFactor)
            : vec3.fromValues(0, 0, 0);

        this.metallicRoughnessTexture = options.metallicRoughnessTexture || null;
        this.metallicRoughnessTexCoord = options.metallicRoughnessTexCoord || 0;
        this.metallicFactor = options.metallicFactor !== undefined ? options.metallicFactor : 1;
        this.roughnessFactor = options.roughnessFactor !== undefined ? options.roughnessFactor : 1;

        this.normalTexture = options.normalTexture || null;
        this.normalTexCoord = options.normalTexCoord || 0;
        this.normalFactor = options.normalFactor !== undefined ? options.normalFactor : 1;

        this.occlusionTexture = options.occlusionTexture || null;
        this.occlusionTexCoord = options.occlusionTexCoord || 0;
        this.occlusionFactor = options.occlusionFactor !== undefined ? options.occlusionFactor : 1;

        this.emissiveTexture = options.emissiveTexture || null;
        this.emissiveTexCoord = options.emissiveTexCoord || 0;
        this.emissiveFactor = options.emissiveFactor
            ? vec3.clone(options.emissiveFactor)
            : vec3.fromValues(0, 0, 0);
        
            this.alphaMode = options.alphaMode || 'OPAQUE';
            this.alphaCutoff = options.alphaCutoff !== undefined ? options.alphaCutoff : 0.5;
            this.doubleSided = options.doubleSided || false;
    }
}