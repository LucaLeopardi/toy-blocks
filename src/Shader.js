export class Shader {
	
	/** @type {WebGL2RenderingContext} */
	#gl

	static async create(gl, vertPath, fragPath) {
		const program = await this.#createShaderProgram(gl, vertPath, fragPath)
		return new Shader(gl, program)
	}

	constructor(gl, shaderProgram) {
		this.#gl = gl
		/** @type {WebGLProgram} */
		this.program = shaderProgram
	}

	getUniformLocation = (name) => this.#gl.getUniformLocation(this.program, name)

	getWebGLContext = () => this.#gl

	use() { this.#gl.useProgram(this.program) }


	/* UTILS */

	static async #createShaderProgram(gl, vertPath, fragPath) {
		const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
			this.#loadFile(vertPath),
			this.#loadFile(fragPath)
		])
		const vertexShader = this.#compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER)
		const fragmentShader = this.#compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER)

		const program = gl.createProgram()
		gl.attachShader(program, vertexShader)
		gl.attachShader(program, fragmentShader)
		gl.linkProgram(program)

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error('SHADER:: Failed to link program: ', gl.getProgramInfoLog(program))
			gl.deleteProgram(program)
		}
		return program
	}


	static async #loadFile(path) {
		const response = await fetch(path)
		if (!response.ok) console.error(`SHADER:: Failed to load file: ${path}`)
		return await response.text()
	}


	static #compileShader(gl, source, type) {
		const shader = gl.createShader(type)

		gl.shaderSource(shader, source)
		gl.compileShader(shader)

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const info = gl.getShaderInfoLog(shader)
			gl.deleteShader(shader)
			throw new Error(`SHADER:: Failed to compile shader: ${info}`)
		}
		return shader
	}
}