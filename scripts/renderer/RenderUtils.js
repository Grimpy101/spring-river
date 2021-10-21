import { mat4 } from '../external_libraries/glMatrix/index.js';
export default class RenderUtils {
    static getCameraMatrix(camera) {
        const mvpMatrix = mat4.clone(camera.matrix);
        let parent = camera.parent;
        while (parent) {
            mat4.mul(mvpMatrix, parent.matrix, mvpMatrix);
            parent = parent.parent;
        }
        mat4.invert(mvpMatrix, mvpMatrix);
        return mvpMatrix;
    }
}
//# sourceMappingURL=RenderUtils.js.map