export function createShader(gl: WebGL2RenderingContext, source: string, type: number) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!status) {
        const log = gl.getShaderInfoLog(shader);
        throw new Error('Ne morem prevesti sencilnika\nInfo log:\n' + log);
    }
    return shader;
}

export function createProgram(gl: WebGL2RenderingContext, shaders: WebGLShader[]) {
    const program = gl.createProgram();
    for (let shader of shaders) {
        gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    const status = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!status) {
        const log = gl.getProgramInfoLog(program);
        throw new Error('Ne morem povezati programa\nInfo log:\n' + log);
    }

    let attributes: {[name: string]: number} = {};
    const activeAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < activeAttributes; i++) {
        const info = gl.getActiveAttrib(program, i);
        attributes[info.name] = gl.getAttribLocation(program, info.name);
    }

    let uniforms: {[name: string]: WebGLUniformLocation} = {};
    const activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < activeUniforms; i++) {
        const info = gl.getActiveUniform(program, i);
        uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }

    return { program, attributes, uniforms };
}

export function buildPrograms(gl: WebGL2RenderingContext, shaders: any) {
    var programs: {[name: string]:
        {program: WebGLProgram, attributes: any; uniforms: any;}} = {};
    for (let name in shaders) {
        try {
            let program = shaders[name];
            programs[name] = createProgram(gl, [
                createShader(gl, program.vertex, gl.VERTEX_SHADER),
                createShader(gl, program.fragment, gl.FRAGMENT_SHADER)
            ]);
        } catch (error) {
            throw new Error('Napaka med kompilacijo ' + name + '\n' + error);
        }
    }
    return programs;
}

export function createTexture(gl: WebGL2RenderingContext, options: any) {
    const target = options.target || gl.TEXTURE_2D;
    const iformat = options.iformat || gl.RGBA;
    const format = options.format || gl.RGBA;
    const type = options.type || gl.UNSIGNED_BYTE;
    const texture = options.texture || gl.createTexture();

    if (typeof options.unit !== 'undefined') {
        gl.activeTexture(gl.TEXTURE0 + options.unit);
    }

    gl.bindTexture(target, texture);

    if (options.image) {
        gl.texImage2D(
            target, 0, iformat,
            format, type, options.image
        );
    } else {
        gl.texImage2D(
            target, 0, iformat,
            options.width, options.height, 0,
            format, type, options.data
        );
    }

    if (options.wrapS) {
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, options.wrapS);
    }
    if (options.wrapT) {
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, options.wrapT);
    }
    if (options.min) {
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, options.min);
    }
    if (options.mag) {
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, options.mag);
    }
    if (options.mip) {
        gl.generateMipmap(target);
    }

    return texture as WebGLTexture;
}

export function createBuffer(gl: WebGL2RenderingContext, options: any) {
    const target = options.target || gl.ARRAY_BUFFER;
    const hint = options.hint || gl.STATIC_DRAW;
    const buffer = options.buffer || gl.createBuffer();

    gl.bindBuffer(target, buffer);
    gl.bufferData(target, options.data, hint);

    return buffer as WebGLBuffer;
}

export function createUnitQuad(gl: WebGL2RenderingContext) {
    return createBuffer(
        gl,
        { data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]) }
    );
}

export function createClipQuad(gl: WebGL2RenderingContext) {
    return createBuffer(
        gl,
        { data: new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]) }
    );
}

export function createSampler(gl: WebGL2RenderingContext, options: any) {
    const sampler = options.sampler || gl.createSampler();

    if (options.wrapS) {
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, options.wrapS);
    }
    if (options.wrapT) {
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_T, options.wrapT);
    }
    if (options.min) {
        gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, options.min);
    }
    if (options.mag) {
        gl.samplerParameteri(sampler, gl.TEXTURE_MAG_FILTER, options.mag);
    }

    return sampler as WebGLSampler;
}