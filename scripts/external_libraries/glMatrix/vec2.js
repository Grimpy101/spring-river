import * as glMatrix from "./common.js";
export function create() {
    let out = new glMatrix.ARRAY_TYPE(2);
    if (glMatrix.ARRAY_TYPE != Float32Array) {
        out[0] = 0;
        out[1] = 0;
    }
    return out;
}
export function clone(a) {
    let out = new glMatrix.ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
}
export function fromValues(x, y) {
    let out = new glMatrix.ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
}
export function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
}
export function set(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
}
export function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
}
export function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
}
export function multiply(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
}
export function divide(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
}
export function ceil(out, a) {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);
    return out;
}
export function floor(out, a) {
    out[0] = Math.floor(a[0]);
    out[1] = Math.floor(a[1]);
    return out;
}
export function min(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
}
export function max(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
}
export function round(out, a) {
    out[0] = Math.round(a[0]);
    out[1] = Math.round(a[1]);
    return out;
}
export function scale(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
}
export function scaleAndAdd(out, a, b, scale) {
    out[0] = a[0] + b[0] * scale;
    out[1] = a[1] + b[1] * scale;
    return out;
}
export function distance(a, b) {
    var x = b[0] - a[0], y = b[1] - a[1];
    return Math.hypot(x, y);
}
export function squaredDistance(a, b) {
    var x = b[0] - a[0], y = b[1] - a[1];
    return x * x + y * y;
}
export function length(a) {
    var x = a[0], y = a[1];
    return Math.hypot(x, y);
}
export function squaredLength(a) {
    var x = a[0], y = a[1];
    return x * x + y * y;
}
export function negate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
}
export function inverse(out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    return out;
}
export function normalize(out, a) {
    var x = a[0], y = a[1];
    var len = x * x + y * y;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
    }
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    return out;
}
export function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
}
export function cross(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
}
export function lerp(out, a, b, t) {
    var ax = a[0], ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
}
export function random(out, scale) {
    scale = scale === undefined ? 1.0 : scale;
    var r = glMatrix.RANDOM() * 2.0 * Math.PI;
    out[0] = Math.cos(r) * scale;
    out[1] = Math.sin(r) * scale;
    return out;
}
export function transformMat2(out, a, m) {
    var x = a[0], y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
}
export function transformMat2d(out, a, m) {
    var x = a[0], y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
}
export function transformMat3(out, a, m) {
    var x = a[0], y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
}
export function transformMat4(out, a, m) {
    let x = a[0];
    let y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
}
export function rotate(out, a, b, rad) {
    let p0 = a[0] - b[0], p1 = a[1] - b[1], sinC = Math.sin(rad), cosC = Math.cos(rad);
    out[0] = p0 * cosC - p1 * sinC + b[0];
    out[1] = p0 * sinC + p1 * cosC + b[1];
    return out;
}
export function angle(a, b) {
    let x1 = a[0], y1 = a[1], x2 = b[0], y2 = b[1], mag = Math.sqrt((x1 * x1 + y1 * y1) * (x2 * x2 + y2 * y2)), cosine = mag && (x1 * x2 + y1 * y2) / mag;
    return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
export function zero(out) {
    out[0] = 0.0;
    out[1] = 0.0;
    return out;
}
export function str(a) {
    return "vec2(" + a[0] + ", " + a[1] + ")";
}
export function exactEquals(a, b) {
    return a[0] === b[0] && a[1] === b[1];
}
export function equals(a, b) {
    let a0 = a[0], a1 = a[1];
    let b0 = b[0], b1 = b[1];
    return (Math.abs(a0 - b0) <=
        glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
        Math.abs(a1 - b1) <=
            glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)));
}
export const len = length;
export const sub = subtract;
export const mul = multiply;
export const div = divide;
export const dist = distance;
export const sqrDist = squaredDistance;
export const sqrLen = squaredLength;
export const forEach = (function () {
    let vec = create();
    return function (a, stride, offset, count, fn, arg) {
        let i, l;
        if (!stride) {
            stride = 2;
        }
        if (!offset) {
            offset = 0;
        }
        if (count) {
            l = Math.min(count * stride + offset, a.length);
        }
        else {
            l = a.length;
        }
        for (i = offset; i < l; i += stride) {
            vec[0] = a[i];
            vec[1] = a[i + 1];
            fn(vec, vec, arg);
            a[i] = vec[0];
            a[i + 1] = vec[1];
        }
        return a;
    };
})();
//# sourceMappingURL=vec2.js.map