import { Shader } from "./shader.js"
import { Camera } from "./camera.js"
import { Object3D } from "./object3d.js"
import { Vector3 } from "./utils/vector3.js"
import { Mat4 } from "./utils/mat4.js"
import { Mat3 } from "./utils/mat3.js"

export class SceneRenderer {

	/** @type {WebGL2RenderingContext} */
	gl = null
	outlineColor = [2.0, 0.2, 0.5]
	/** @type {Shader} */
	shader = null
	/** @type {Camera} */
	camera = null
	#backgroundColor = [0.30, 0.35, 0.40]
	spotlightStrength = 0.60
	/** @type {Vector3} */
	lightDirection = null	// Normalized in shader

	constructor(gl, shader, camera) {
		if (!(shader instanceof Shader) || !(camera instanceof Camera)) throw new Error('Renderer::constructor() shaders or camera is not an instance of Shader or Camera')
		if (shader == null || camera == null) throw new Error('Renderer::constructor() shaders or camera is null')
		this.gl = gl
		this.shader = shader
		this.camera = camera
		this.gl.clearColor(this.#backgroundColor[0], this.#backgroundColor[1], this.#backgroundColor[2], 1.0)
		this.lightDirection = new Vector3(1.0, -1.0, -0.5)
	}

	get backgroundColor() { return this.#backgroundColor }
	set backgroundColor(color) {
		if (color == null || color.length != 3) throw new Error('Renderer::backgroundColor() color is null or not an array of 3 elements')
		this.#backgroundColor = color
		this.gl.clearColor(color[0], color[1], color[2], 1.0)
	}

	clear() {
		if (this.gl == null) throw new Error('Renderer::clear(): gl is null')
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
	}

	bindResources() {
		const location = this.shader.getUniformLocation

		this.shader.use()
		this.gl.uniformMatrix4fv(location('u_viewMatrix'), true, this.camera.viewMatrix.values)
		this.gl.uniformMatrix4fv(location('u_projectionMatrix'), true, this.camera.projectionMatrix.values)
		this.gl.uniform1f(location('u_diffuse'), this.spotlightStrength)
		this.gl.uniform3f(location('u_ambientColor'), this.#backgroundColor[0], this.#backgroundColor[1], this.#backgroundColor[2])
		this.gl.uniform3f(location('u_directionToLight'), -this.lightDirection.x, -this.lightDirection.y, -this.lightDirection.z)	// Normalized in shader
	}

	draw(obj, parentModelMatrix = null) {
		if (this.gl == null) throw new Error('Renderer::draw(): gl is null')
		if(obj == null || obj instanceof Object3D == false ) return
		const location = this.shader.getUniformLocation
		
		const modelMatrix = parentModelMatrix ? Mat4.PreMultiply(parentModelMatrix, obj.modelMatrix) : obj.modelMatrix

		this.gl.uniformMatrix4fv(location('u_modelMatrix'), true, modelMatrix.values)
		this.gl.uniformMatrix3fv(location('u_normalMatrix'), true, this.#getNormalMatrix(modelMatrix))
		this.gl.uniform3f(location('u_color'), obj.color[0], obj.color[1], obj.color[2])
		
		obj.draw()
		if (obj.selected) {
			this.gl.uniform3f(location('u_color'), this.outlineColor[0], this.outlineColor[1], this.outlineColor[2])
			this.gl.uniform1f(location('u_diffuse'), 0.1)
			obj.drawOutline()
			this.gl.uniform1f(location('u_diffuse'), this.spotlightStrength)
		}
		for (const childObject of obj.children) this.draw(childObject, modelMatrix)
	}

	#getNormalMatrix(modelMatrix) {
		if (modelMatrix == null || modelMatrix instanceof Mat4 == false ) throw new Error('Renderer::getNormalMatrixArrayTransposed() modelMatrix is null or not an instance of Mat4')
		if (this.camera == null || this.camera instanceof Camera == false) throw new Error('Renderer::getNormalMatrixArrayTransposed() camera is null or not an instance of Camera')

		const modelViewMatrix = Mat4.PreMultiply(this.camera.viewMatrix, modelMatrix)
		const normalMatrix = Mat3.Inverse(Mat3.FromMat4(modelViewMatrix))
		return normalMatrix.values
	 }
}