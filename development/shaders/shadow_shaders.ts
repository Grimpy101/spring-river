const vertex = `#version 300 es
precision mediump float;

layout (location = 0) in vec4 aPosition;

uniform mat4 uMVPMatrix;

void main() {
    gl_Position = uMVPMatrix * aPosition;
}
`;

const fragment = `#version 300 es
precision mediump float;

layout(location = 0) out float fragmentdepth;

void main() {
    fragmentdepth = gl_FragCoord.z;
}
`;
