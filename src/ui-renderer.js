import { Shader } from "./shader.js"
import { Camera } from "./camera.js"
import { Object3D } from "./object3d.js"
import { Mat4 } from "./utils/mat4.js"


export class UIRenderer {

	/** @type {WebGL2RenderingContext} */
	gl = null
	/** @type {Shader} */
	shader = null
	/** @type {Camera} */
	camera = null
	/** @type {Mat4} */
	#uiProjectionMatrix = null

	constructor(gl, shader, camera) {
		if (!(shader instanceof Shader) || !(camera instanceof Camera)) throw new Error('Renderer::constructor() shaders or camera is not an instance of Shader or Camera')
		if (shader == null || camera == null) throw new Error('Renderer::constructor() shaders or camera is null')
		this.gl = gl
		this.shader = shader
		this.camera = camera		
		this.#uiProjectionMatrix = Mat4.ZeroMatrix()
		this.updateUiProjectionMatrix()
	}

	clear() {
		if (this.gl == null) throw new Error('Renderer::clear(): gl is null')
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT)
	}

	bindResources() {
		const location = this.shader.getUniformLocation

		this.shader.use()
		this.gl.uniformMatrix4fv(location('u_viewMatrix'), true, this.camera.viewRotationMatrix.values)
		this.gl.uniformMatrix4fv(location('u_projectionMatrix'), true, this.#uiProjectionMatrix.values)
	}
	
	draw(obj, parentModelMatrix = null) {
		if (this.gl == null) throw new Error('Renderer::draw(): gl is null')
		if(obj == null || obj instanceof Object3D == false ) return
		const location = this.shader.getUniformLocation
		
		const modelMatrix = parentModelMatrix ? Mat4.PreMultiply(parentModelMatrix, obj.modelMatrix) : obj.modelMatrix

		this.gl.uniformMatrix4fv(location('u_modelMatrix'), true, modelMatrix.values)
		this.gl.uniform3f(location('u_color'), obj.color[0], obj.color[1], obj.color[2])
		
		obj.draw()
		for (const childObject of obj.children) this.draw(childObject, modelMatrix)
	}

	// Ortho projection matrix with hardcoded view volume size
	updateUiProjectionMatrix() {			
		this.#uiProjectionMatrix.set(0, 0, 1.0 / 3.0)		// 1.0 / orthoWidth
		this.#uiProjectionMatrix.set(1, 1, 1.0 / 3.0)		// 1.0 / orthoHeight
		this.#uiProjectionMatrix.set(2, 2, -2.0 / 6.0)		// -2.0 / (far - near)
		this.#uiProjectionMatrix.set(2, 3, 0.0)				// -(far + near) / (far - near)
		this.#uiProjectionMatrix.set(3, 3, 1.0)				// 1.0
	}
}