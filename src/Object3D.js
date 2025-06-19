import { Mat4 } from "./utils/mat4.js"
import { Vector3 } from "./utils/vector3.js"

export class Object3D {
	static #idCounter = 0

	// WebGL private members
	/** @type {WebGL2RenderingContext} */
	#gl = null
	#vao = null
	#vbo = null	// Reference only used in delete()
	#ibo = null
	#iboLength = null

	// Object3D default properties (can be overridden)
	id = null
	name = 'Object3D'
	typeName = 'Object3D'
	#transform = {
		position: Vector3.Zero(),
		rotation: Vector3.Zero(),
		scale: Vector3.One()
	}
	#modelMatrix = Mat4.IdentityMatrix()
	color = [0.5, 0.5, 0.5]
	/** @type {Object3D} */
	parent = null
	/** @type {Object3D[]} */
	children = []
	#selected = false

	get position() { return this.#transform.position }
	set position(v) {
		this.#transform.position = v
		this.updateModelMatrix()
	}

	get rotation() { return this.#transform.rotation }
	set rotation(v) {
		this.#transform.rotation = v
		this.updateModelMatrix()
	}

	get scale() { return this.#transform.scale }
	set scale(v) {
		this.#transform.scale = v
		this.updateModelMatrix()
	}

	get modelMatrix() { return this.#modelMatrix }
	updateModelMatrix() {
		const translation = Mat4.FromTranslationVector(this.#transform.position)
		const rotation = Mat4.FromRotationVector(this.#transform.rotation)
		const scaling = Mat4.FromScaleVector(this.#transform.scale)
		// Order of transformations: Scaling -> Rotation -> Translation
		this.#modelMatrix = Mat4.PreMultiply(translation, Mat4.PreMultiply(rotation, scaling))
	}

	get selected() { return this.#selected }
	set selected(value) {
		this.#selected = value
		for (const child of this.children) child.selected = value
	}


	constructor(webGLContext, vboData, iboData) {
		if (webGLContext === null && vboData === null && iboData === null) return	// Empty object (used for Scene root

		this.id = Object3D.#idCounter++

		this.#gl = webGLContext
		const gl = this.#gl

		this.#vbo = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.#vbo)
		gl.bufferData(gl.ARRAY_BUFFER, vboData, gl.STATIC_DRAW)

		this.#vao = gl.createVertexArray()
		gl.bindVertexArray(this.#vao)
		gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0)
		gl.enableVertexAttribArray(0)
		gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT)
		gl.enableVertexAttribArray(1)
		
		this.#iboLength = iboData.length
		this.#ibo = gl.createBuffer()
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.#ibo)
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, iboData, gl.STATIC_DRAW)

		gl.bindVertexArray(null)
		gl.bindBuffer(gl.ARRAY_BUFFER, null)
	}

	delete() {
		const gl = this.#gl
		gl.deleteVertexArray(this.#vao)
		gl.deleteBuffer(this.#vbo)
		gl.deleteBuffer(this.#ibo)
	}

	drawOutline() {
		if (!this.#vao || !this.#ibo) throw new Error('Object3D:: draw() called on uninitialized object (no VAO or IBO)')
		const gl = this.#gl

		gl.bindVertexArray(this.#vao)
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.#ibo)
		gl.drawElements(gl.LINE_LOOP, this.#iboLength, gl.UNSIGNED_BYTE, 0)

		gl.bindVertexArray(null)
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
	}

	draw() {
		if (!this.#vao || !this.#ibo) throw new Error('Object3D:: draw() called on uninitialized object (no VAO or IBO)')
		const gl = this.#gl

		gl.bindVertexArray(this.#vao)
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.#ibo)
		gl.drawElements(gl.TRIANGLES, this.#iboLength, gl.UNSIGNED_BYTE, 0)

		gl.bindVertexArray(null)
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
	}
}

export class RootObject extends Object3D {
	constructor() {
		super(null, null, null)
	}
	delete() {}
	drawOutline() {}
	draw() {}
	
}

export class EmptyObject extends Object3D {
	constructor(gl) {
		// Copied from Cube but smaller. Only used for drawing outline as a gizmo.
		const vboData = new Float32Array([
			// POSITION			// NORMAL
			// Bottom face
			-0.05, -0.05, -0.05,	 0, -1,  0,	// 0
			 0.05, -0.05, -0.05, 	 0, -1,  0,	// 1
			 0.05, -0.05,  0.05,	 0, -1,  0,	// 2
			-0.05, -0.05,  0.05,	 0, -1,  0,	// 3
			// Front face
			-0.05, -0.05,  0.05,	 0,  0,  1,	// 4
			 0.05, -0.05,  0.05,	 0,  0,  1,	// 5
			 0.05,  0.05,  0.05,	 0,  0,  1,	// 6
			-0.05,  0.05,  0.05,	 0,  0,  1,	// 7
			// Top face
			-0.05,  0.05,  0.05,	 0,  1,  0,	// 8
			 0.05,  0.05,  0.05,	 0,  1,  0,	// 9
			 0.05,  0.05, -0.05,	 0,  1,  0,	// 10
			-0.05,  0.05, -0.05,	 0,  1,  0,	// 11
			// Back face
			 0.05, -0.05, -0.05,	 0,  0, -1,	// 12
			-0.05, -0.05, -0.05,	 0,  0, -1,	// 13
			-0.05,  0.05, -0.05,	 0,  0, -1,	// 14
			 0.05,  0.05, -0.05,	 0,  0, -1,	// 15
			// Left face
			-0.05, -0.05, -0.05,	-1,  0,  0,	// 16
			-0.05, -0.05,  0.05,	-1,  0,  0,	// 17
			-0.05,  0.05,  0.05,	-1,  0,  0,	// 18
			-0.05,  0.05, -0.05,	-1,  0,  0,	// 19
			// Right face
			 0.05, -0.05,  0.05,	 1,  0,  0,	// 20
			 0.05, -0.05, -0.05,	 1,  0,  0,	// 21
			 0.05,  0.05, -0.05,	 1,  0,  0,	// 22
			 0.05,  0.05,  0.05,	 1,  0,  0	// 23
		])
		const iboData = new Uint8Array([	// Cube topology sucks BUT it allows to draw the wireframe with GL_LINE_LOOP using the same IBO 
			// Front face
			4, 5, 7,
			7, 5, 6,
			// Right face
			20, 21, 23,
			23, 21, 22,
			// Bottom face
			3, 0, 2,
			2, 0, 1,
			// Back face
			13, 14, 12,
			12, 14, 15,
			// Left face
			17, 18, 16,
			16, 18, 19,
			// Top face
			8, 9, 11,
			11, 9, 10
		])
		super(gl, vboData, iboData) 
		this.name = 'Empty Object'
		this.typeName = 'Empty Object'
	}

	draw() {}
}

export class Cube extends Object3D {
	constructor(gl) {	
		const vboData = new Float32Array([
			// POSITION			// NORMAL
			// Bottom face
			-0.5, -0.5, -0.5,	 0, -1,  0,	// 0
			 0.5, -0.5, -0.5, 	 0, -1,  0,	// 1
			 0.5, -0.5,  0.5,	 0, -1,  0,	// 2
			-0.5, -0.5,  0.5,	 0, -1,  0,	// 3
			// Front face
			-0.5, -0.5,  0.5,	 0,  0,  1,	// 4
			 0.5, -0.5,  0.5,	 0,  0,  1,	// 5
			 0.5,  0.5,  0.5,	 0,  0,  1,	// 6
			-0.5,  0.5,  0.5,	 0,  0,  1,	// 7
			// Top face
			-0.5,  0.5,  0.5,	 0,  1,  0,	// 8
			 0.5,  0.5,  0.5,	 0,  1,  0,	// 9
			 0.5,  0.5, -0.5,	 0,  1,  0,	// 10
			-0.5,  0.5, -0.5,	 0,  1,  0,	// 11
			// Back face
			 0.5, -0.5, -0.5,	 0,  0, -1,	// 12
			-0.5, -0.5, -0.5,	 0,  0, -1,	// 13
			-0.5,  0.5, -0.5,	 0,  0, -1,	// 14
			 0.5,  0.5, -0.5,	 0,  0, -1,	// 15
			// Left face
			-0.5, -0.5, -0.5,	-1,  0,  0,	// 16
			-0.5, -0.5,  0.5,	-1,  0,  0,	// 17
			-0.5,  0.5,  0.5,	-1,  0,  0,	// 18
			-0.5,  0.5, -0.5,	-1,  0,  0,	// 19
			// Right face
			 0.5, -0.5,  0.5,	 1,  0,  0,	// 20
			 0.5, -0.5, -0.5,	 1,  0,  0,	// 21
			 0.5,  0.5, -0.5,	 1,  0,  0,	// 22
			 0.5,  0.5,  0.5,	 1,  0,  0	// 23
		])
		const iboData = new Uint8Array([	// Cube topology sucks BUT it allows to draw the wireframe with GL_LINE_LOOP using the same IBO 
			// Front face
			4, 5, 7,
			7, 5, 6,
			// Right face
			20, 21, 23,
			23, 21, 22,
			// Bottom face
			3, 0, 2,
			2, 0, 1,
			// Back face
			13, 14, 12,
			12, 14, 15,
			// Left face
			17, 18, 16,
			16, 18, 19,
			// Top face
			8, 9, 11,
			11, 9, 10
		])
		super(gl, vboData, iboData) 
		this.name = 'Cube' 
		this.typeName = 'Cube' 
	}
}

export class Pyramid extends Object3D {
	constructor(gl) {
		const vboData = new Float32Array([
			// POSITION			// NORMAL
			// Bottom face
			-0.5, -0.5, -0.5,	 0, -1,  0,
			 0.5, -0.5, -0.5, 	 0, -1,  0,
		     0.5, -0.5,  0.5,	 0, -1,  0,
			-0.5, -0.5,  0.5,	 0, -1,  0,
			// Front face
			-0.5, -0.5,  0.5,	 0, 0.5, 1.0,
			 0.5, -0.5,  0.5,	 0, 0.5, 1.0,
			 0,    0.5,  0,		 0, 0.5, 1.0,
			// Back face
			 0.5, -0.5, -0.5,	 0, 0.5, -1.0,
			-0.5, -0.5, -0.5,	 0, 0.5, -1.0,
			 0,    0.5,  0,		 0, 0.5, -1.0,
			// Left face
			-0.5, -0.5, -0.5,	-1.0, 0.5, 0,
			-0.5, -0.5,  0.5,	-1.0, 0.5, 0,
			 0,    0.5,  0,		-1.0, 0.5, 0,
			// Right face
			 0.5, -0.5,  0.5,	 1.0, 0.5, 0,
			 0.5, -0.5, -0.5,	 1.0, 0.5, 0,
			 0,    0.5,  0,		 1.0, 0.5, 0
		])
		const iboData = new Uint8Array([
			// Bottom face
			0, 1, 3,
			1, 2, 3,
			// Front face
			4, 5, 6,
			// Back face
			7, 8, 9,
			// Left face
			10, 11, 12,
			// Right face
			13, 14, 15
		])
		super(gl, vboData, iboData)
		this.name = 'Pyramid'
		this.typeName = 'Pyramid'
	}
}

export class Tetrahedron extends Object3D {
	constructor(gl) {
		const vboData = new Float32Array([
			// POSITION			// NORMAL
			// Front-bottom face
			-0.5, -0.5, -0.5, 	-0.33, -0.33,  0.33,
			 0.5, -0.5,  0.5, 	-0.33, -0.33,  0.33,
			-0.5,  0.5, 0.5, 	-0.33, -0.33,  0.33,
			// Front-top face
			 0.5, -0.5,  0.5, 	 0.33, 0.33,  0.33,
			 0.5,  0.5, -0.5, 	 0.33, 0.33,  0.33,
			-0.5,  0.5,  0.5, 	 0.33, 0.33,  0.33,
			// Back-bottom face
			-0.5, -0.5, -0.5, 	 0.33, -0.33, -0.33,
			 0.5,  0.5, -0.5, 	 0.33, -0.33, -0.33,
			 0.5, -0.5,  0.5, 	 0.33, -0.33, -0.33,
			// Back-top face
			-0.5, -0.5, -0.5, 	-0.33,  0.33, -0.33,
			-0.5,  0.5,  0.5, 	-0.33,  0.33, -0.33,
			 0.5,  0.5, -0.5, 	-0.33,  0.33, -0.33
		])
		const iboData = new Uint8Array([
			// Front-bottom face
			0, 1, 2,
			// Front-top face
			3, 4, 5,
			// Back-bottom face
			6, 7, 8,
			// Back-top face
			9, 10, 11
		])
		super(gl, vboData, iboData) 
		this.name = 'Tetrahedron'
		this.typeName = 'Tetrahedron'
	}
}

export class Cone extends Object3D {
	constructor(gl) {
		const vboData = new Float32Array([
			// POSITION					// NORMAL
			// Bottom center vertex
			 0.0, -0.5,  0.0, 	 		0, -1,  0,	// 0

			// Bottom circle vertices
			// Front-right quarter
			 0.0,    -0.5,     0.5, 	0, -1,  0,	// 1
			 0.1545, -0.5,  0.4755, 	0, -1,  0,	// 2
			 0.2939, -0.5,  0.4045, 	0, -1,  0,	// 3
			 0.4045, -0.5,  0.2939, 	0, -1,  0,	// 4
			 0.4755, -0.5,  0.1545, 	0, -1,  0,	// 5
			 //Back-right quarter
			 0.5,    -0.5,     0.0, 	0, -1,  0,	// 6
			 0.4755, -0.5, -0.1545, 	0, -1,  0,	// 7
			 0.4045, -0.5, -0.2939, 	0, -1,  0,	// 8
			 0.2939, -0.5, -0.4045, 	0, -1,  0,	// 9
			 0.1545, -0.5, -0.4755, 	0, -1,  0,	// 10
			 // Back-left quarter
			 0.0,    -0.5,    -0.5, 	0, -1,  0,	// 11
			-0.1545, -0.5, -0.4755, 	0, -1,  0,	// 12
			-0.2939, -0.5, -0.4045, 	0, -1,  0,	// 13
			-0.4045, -0.5, -0.2939, 	0, -1,  0,	// 14
			-0.4755, -0.5, -0.1545, 	0, -1,  0,	// 15
			 // Front-left quarter
			-0.5,    -0.5,     0.0, 	0, -1,  0,	// 16
			-0.4755, -0.5,  0.1545, 	0, -1,  0,	// 17
			-0.4045, -0.5,  0.2939, 	0, -1,  0,	// 18
			-0.2939, -0.5,  0.4045, 	0, -1,  0,	// 19
			-0.1545, -0.5,  0.4755, 	0, -1,  0,	// 20

			// Side vertices
			// Front-right quarter
			 0.0,	 -0.5,	0.5, 		 0.0,	  0.25,  0.5,		// 21
			 0.1545, -0.5,  0.4755, 	 0.1545,  0.25,  0.4755,	// 22
			 0.2939, -0.5,  0.4045, 	 0.2939,  0.25,  0.4045,	// 23
			 0.4045, -0.5,  0.2939, 	 0.4045,  0.25,  0.2939,	// 24
			 0.4755, -0.5,  0.1545, 	 0.4755,  0.25,  0.1545,	// 25
			 // Back-right quarter
			 0.5,	 -0.5,	0.0, 		 0.5,	  0.25,  0.0,		// 26
			 0.4755, -0.5, -0.1545, 	 0.4755,  0.25, -0.1545,	// 27
			 0.4045, -0.5, -0.2939, 	 0.4045,  0.25, -0.2939,	// 28
			 0.2939, -0.5, -0.4045, 	 0.2939,  0.25, -0.4045,	// 29
			 0.1545, -0.5, -0.4755, 	 0.1545,  0.25, -0.4755,	// 30
			 // Back-left quarter
			 0.0,	 -0.5,	-0.5, 		 0.0,	  0.25, -0.5,		// 31
			-0.1545, -0.5, -0.4755, 	-0.1545,  0.25, -0.4755,	// 32
			-0.2939, -0.5, -0.4045, 	-0.2939,  0.25, -0.4045,	// 33
			-0.4045, -0.5, -0.2939, 	-0.4045,  0.25, -0.2939,	// 34
			-0.4755, -0.5, -0.1545, 	-0.4755,  0.25, -0.1545,	// 35
			 // Front-left quarter
			-0.5,	 -0.5,	0.0, 		-0.5,	  0.25,  0.0,		// 36
			-0.4755, -0.5,  0.1545, 	-0.4755,  0.25,  0.1545,	// 37
			-0.4045, -0.5,  0.2939, 	-0.4045,  0.25,  0.2939,	// 38
			-0.2939, -0.5,  0.4045, 	-0.2939,  0.25,  0.4045,	// 39
			-0.1545, -0.5,  0.4755, 	-0.1545,  0.25,  0.4755,	// 40

			// Top vertex
			// The normal is NOT physically correct. Like, at all. But the alternative is to add a LOT more triangles.
			 0.0,  0.5,  0.0, 		 0.0,  0.0,  1.0,	// 41
		])
		const iboData = new Uint8Array([
			// Bottom circle
			// Front-right quarter
			0, 2, 1,
			0, 3, 2,
			0, 4, 3,
			0, 5, 4,
			// Back-right quarter
			0, 6, 5,
			0, 7, 6,
			0, 8, 7,
			0, 9, 8,
			0, 10, 9,
			// Back-left quarter
			0, 11, 10,
			0, 12, 11,
			0, 13, 12,
			0, 14, 13,
			0, 15, 14,
			// Front-left quarter
			0, 16, 15,
			0, 17, 16,
			0, 18, 17,
			0, 19, 18,
			0, 20, 19,
			0, 1, 20,

			// Side faces
			// Front-right quarter
			21, 22, 41,
			22, 23, 41,
			23, 24, 41,
			24, 25, 41,
			25, 26, 41,
			// Back-41ght quarter
			26, 27, 41,
			27, 28, 41,
			28, 29, 41,
			29, 30, 41,
			30, 31, 41,
			// Back-41ft quarter
			31, 32, 41,
			32, 33, 41,
			33, 34, 41,
			34, 35, 41,
			35, 36, 41,
			// Front41eft quarter
			36, 37, 41,
			37, 38, 41,
			38, 39, 41,
			39, 40, 41,
			40, 21, 41
		])
		super(gl, vboData, iboData)
		this.name = 'Cone'
		this.typeName = 'Cone'
	}
}

export class Cylinder extends Object3D {
	constructor(gl) {
		const vboData = new Float32Array([
			// POSITION					// NORMAL

			// Bottom circle vertices
			// Bottom center vertex
			 0.0, 	 -0.5,  	0.0, 	0, -1,  0,	// 0
			// Front-right quarter
			 0.0,    -0.5,     0.5, 	0, -1,  0,	// 1
			 0.1545, -0.5,  0.4755, 	0, -1,  0,	// 2
			 0.2939, -0.5,  0.4045, 	0, -1,  0,	// 3
			 0.4045, -0.5,  0.2939, 	0, -1,  0,	// 4
			 0.4755, -0.5,  0.1545, 	0, -1,  0,	// 5
			 //Back-right quarter
			 0.5,    -0.5,     0.0, 	0, -1,  0,	// 6
			 0.4755, -0.5, -0.1545, 	0, -1,  0,	// 7
			 0.4045, -0.5, -0.2939, 	0, -1,  0,	// 8
			 0.2939, -0.5, -0.4045, 	0, -1,  0,	// 9
			 0.1545, -0.5, -0.4755, 	0, -1,  0,	// 10
			 // Back-left quarter
			 0.0,    -0.5,    -0.5, 	0, -1,  0,	// 11
			-0.1545, -0.5, -0.4755, 	0, -1,  0,	// 12
			-0.2939, -0.5, -0.4045, 	0, -1,  0,	// 13
			-0.4045, -0.5, -0.2939, 	0, -1,  0,	// 14
			-0.4755, -0.5, -0.1545, 	0, -1,  0,	// 15
			 // Front-left quarter
			-0.5,    -0.5,     0.0, 	0, -1,  0,	// 16
			-0.4755, -0.5,  0.1545, 	0, -1,  0,	// 17
			-0.4045, -0.5,  0.2939, 	0, -1,  0,	// 18
			-0.2939, -0.5,  0.4045, 	0, -1,  0,	// 19
			-0.1545, -0.5,  0.4755, 	0, -1,  0,	// 20	

			// Bottom side vertices
			// Front-right quarter
			 0.0,	 -0.5,	0.5, 		 0.0,	  0.0,  0.5,	// 21
			 0.1545, -0.5,  0.4755, 	 0.1545,  0.0,  0.4755,	// 22
			 0.2939, -0.5,  0.4045, 	 0.2939,  0.0,  0.4045,	// 23
			 0.4045, -0.5,  0.2939, 	 0.4045,  0.0,  0.2939,	// 24
			 0.4755, -0.5,  0.1545, 	 0.4755,  0.0,  0.1545,	// 25
			 // Back-right quarter
			 0.5,	 -0.5,	0.0, 		 0.5,	  0.0,  0.0,	// 26
			 0.4755, -0.5, -0.1545, 	 0.4755,  0.0, -0.1545,	// 27
			 0.4045, -0.5, -0.2939, 	 0.4045,  0.0, -0.2939,	// 28
			 0.2939, -0.5, -0.4045, 	 0.2939,  0.0, -0.4045,	// 29
			 0.1545, -0.5, -0.4755, 	 0.1545,  0.0, -0.4755,	// 30
			 // Back-left quarter
			 0.0,	 -0.5,	-0.5, 		 0.0,	  0.0, -0.5,	// 31
			-0.1545, -0.5, -0.4755, 	-0.1545,  0.0, -0.4755,	// 32
			-0.2939, -0.5, -0.4045, 	-0.2939,  0.0, -0.4045,	// 33
			-0.4045, -0.5, -0.2939, 	-0.4045,  0.0, -0.2939,	// 34
			-0.4755, -0.5, -0.1545, 	-0.4755,  0.0, -0.1545,	// 35
			 // Front-left quarter
			-0.5,	 -0.5,	0.0, 		-0.5,	  0.0,  0.0,	// 36
			-0.4755, -0.5,  0.1545, 	-0.4755,  0.0,  0.1545,	// 37
			-0.4045, -0.5,  0.2939, 	-0.4045,  0.0,  0.2939,	// 38
			-0.2939, -0.5,  0.4045, 	-0.2939,  0.0,  0.4045,	// 39
			-0.1545, -0.5,  0.4755, 	-0.1545,  0.0,  0.4755,	// 40

			// Top circle vertices
			// Top center vertex
			 0.0,	  0.5,	0.0, 		0, 1, 0,	// 41
			// Front-right quarter
			 0.0,     0.5,     0.5, 	0, 1, 0,	// 42
			 0.1545,  0.5,  0.4755, 	0, 1, 0,	// 43
			 0.2939,  0.5,  0.4045, 	0, 1, 0,	// 44
			 0.4045,  0.5,  0.2939, 	0, 1, 0,	// 45
			 0.4755,  0.5,  0.1545, 	0, 1, 0,	// 46
			 //Back-right quarter
			 0.5,     0.5,     0.0, 	0, 1, 0,	// 47
			 0.4755,  0.5, -0.1545, 	0, 1, 0,	// 48
			 0.4045,  0.5, -0.2939, 	0, 1, 0,	// 49
			 0.2939,  0.5, -0.4045, 	0, 1, 0,	// 50
			 0.1545,  0.5, -0.4755, 	0, 1, 0,	// 51
			 // Back-left quarter
			 0.0,     0.5,    -0.5, 	0, 1, 0,	// 52
			-0.1545,  0.5, -0.4755, 	0, 1, 0,	// 53
			-0.2939,  0.5, -0.4045, 	0, 1, 0,	// 54
			-0.4045,  0.5, -0.2939, 	0, 1, 0,	// 55
			-0.4755,  0.5, -0.1545, 	0, 1, 0,	// 56
			 // Front-left quarter
			-0.5,     0.5,     0.0, 	0, 1, 0,	// 57
			-0.4755,  0.5,  0.1545, 	0, 1, 0,	// 58
			-0.4045,  0.5,  0.2939, 	0, 1, 0,	// 59
			-0.2939,  0.5,  0.4045, 	0, 1, 0,	// 60
			-0.1545,  0.5,  0.4755, 	0, 1, 0,	// 61	

			// Top side vertices
			// Front-right quarter
			 0.0,	  0.5,	0.5, 		 0.0,	  0.0,  0.5,	// 62
			 0.1545,  0.5,  0.4755, 	 0.1545,  0.0,  0.4755,	// 63
			 0.2939,  0.5,  0.4045, 	 0.2939,  0.0,  0.4045,	// 64
			 0.4045,  0.5,  0.2939, 	 0.4045,  0.0,  0.2939,	// 65
			 0.4755,  0.5,  0.1545, 	 0.4755,  0.0,  0.1545,	// 66
			 // Back-right quarter
			 0.5,	  0.5,	0.0, 		 0.5,	  0.0,  0.0,	// 67
			 0.4755,  0.5, -0.1545, 	 0.4755,  0.0, -0.1545,	// 68
			 0.4045,  0.5, -0.2939, 	 0.4045,  0.0, -0.2939,	// 69
			 0.2939,  0.5, -0.4045, 	 0.2939,  0.0, -0.4045,	// 70
			 0.1545,  0.5, -0.4755, 	 0.1545,  0.0, -0.4755,	// 71
			 // Back-left quarter
			 0.0,	  0.5,	-0.5, 		 0.0,	  0.0, -0.5,	// 72
			-0.1545,  0.5, -0.4755, 	-0.1545,  0.0, -0.4755,	// 73
			-0.2939,  0.5, -0.4045, 	-0.2939,  0.0, -0.4045,	// 74
			-0.4045,  0.5, -0.2939, 	-0.4045,  0.0, -0.2939,	// 75
			-0.4755,  0.5, -0.1545, 	-0.4755,  0.0, -0.1545,	// 76
			 // Front-left quarter
			-0.5,	  0.5,	0.0, 		-0.5,	  0.0,  0.0,	// 77
			-0.4755,  0.5,  0.1545, 	-0.4755,  0.0,  0.1545,	// 78
			-0.4045,  0.5,  0.2939, 	-0.4045,  0.0,  0.2939,	// 79
			-0.2939,  0.5,  0.4045, 	-0.2939,  0.0,  0.4045,	// 80
			-0.1545,  0.5,  0.4755, 	-0.1545,  0.0,  0.4755,	// 81 
		])
		const iboData = new Uint8Array([
			// Bottom circle
			// Front-right quarter
			0, 2, 1,
			0, 3, 2,
			0, 4, 3,
			0, 5, 4,
			// Back-right quarter
			0, 6, 5,
			0, 7, 6,
			0, 8, 7,
			0, 9, 8,
			0, 10, 9,
			// Back-left quarter
			0, 11, 10,
			0, 12, 11,
			0, 13, 12,
			0, 14, 13,
			0, 15, 14,
			// Front-left quarter
			0, 16, 15,
			0, 17, 16,
			0, 18, 17,
			0, 19, 18,
			0, 20, 19,
			0, 1, 20,

			// Bottom side triangles
			// Front-right quarter
			21, 22, 62,
			22, 23, 63,
			23, 24, 64,
			24, 25, 65,
			25, 26, 66,
			// Back-right quarter
			26, 27, 67,
			27, 28, 68,
			28, 29, 69,
			29, 30, 70,
			30, 31, 71,
			// Back-left quarter
			31, 32, 72,
			32, 33, 73,
			33, 34, 74,
			34, 35, 75,
			35, 36, 76,
			// Front-left quarter
			36, 37, 77,
			37, 38, 78,
			38, 39, 79,
			39, 40, 80,
			40, 21, 81,

			// Top circle
			// Front-right quarter
			41, 42, 43,
			41, 43, 44,
			41, 44, 45,
			41, 45, 46,
			41, 46, 47,
			// Back-right quarter
			41, 47, 48,
			41, 48, 49,
			41, 49, 50,
			41, 50, 51,
			41, 51, 52,
			// Back-left quarter
			41, 52, 53,
			41, 53, 54,
			41, 54, 55,
			41, 55, 56,
			41, 56, 57,
			// Front-left quarter
			41, 57, 58,
			41, 58, 59,
			41, 59, 60,
			41, 60, 61,
			41, 61, 42,

			// Top side triangles
			// Front-right quarter
			22, 63, 62,
			23, 64, 63,
			24, 65, 64,
			25, 66, 65,
			26, 67, 66,
			// Back-right quarter
			27, 68, 67,
			28, 69, 68,
			29, 70, 69,
			30, 71, 70,
			31, 72, 71,
			// Back-left quarter
			32, 73, 72,
			33, 74, 73,
			34, 75, 74,
			35, 76, 75,
			36, 77, 76,
			// Front-left quarter
			37, 78, 77,
			38, 79, 78,
			39, 80, 79,
			40, 81, 80,
			21, 62, 81
		])
		super(gl, vboData, iboData)
		this.name = 'Cylinder'
		this.typeName = 'Cylinder'
	}
}