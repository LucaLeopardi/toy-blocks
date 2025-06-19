import { Mat4 } from "./utils/mat4.js"
import { Vector3 } from "./utils/vector3.js"

export class Camera {

	// Camera movement parameters
	#input = {}
	speed = 0.4
	sensitivity = 3.0

	// Camera parameters
	#transform = {
		position: Vector3.Zero(),
		rotation: Vector3.Zero()
	}
	#viewTranslationMatrix = Mat4.IdentityMatrix()
	#viewRotationMatrix = Mat4.IdentityMatrix()
	#viewMatrix = Mat4.IdentityMatrix()

	// Projections matrices parameters. Properly initialized in loadDefaultValues and updates in setters.
	// User controls only FOV and width, height is calculated via aspectRatio.
	orthogonalMode = false
	#hFov = 1.0
	#aspectRatio = 1.0
	#perspWidth = 1.0
	#perspHeight = 1.0
	#orthoWidth = 1.0
	#orthoHeight = 1.0
	#near = 0.1
	#far = 1000.0
	#perspectiveMatrix = Mat4.IdentityMatrix()	// Properly initialized in constructor
	#orthogonalMatrix = Mat4.IdentityMatrix()	// Properly initialized in constructor

	// Listener for UI updates
	updateListener = null


	constructor(canvas) {
		// Mouse input binding
		canvas.addEventListener('mousedown', (event) => this.#input[event.button] = true)
		window.addEventListener('mouseup', (event) => this.#input[event.button] = false)
		window.addEventListener('mousemove', (event) => this.#input['mousemove'] = [event.movementX, event.movementY])
		window.addEventListener('contextmenu', (event) => event.preventDefault())
		canvas.addEventListener('wheel', (event) => {
			event.preventDefault()
			this.#input['mousewheel'] = event.deltaY
		})
		// Keyboard input binding
		window.addEventListener(
			'keydown', 
			(event) => { 
				if(document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return 
				this.#input[event.key] = true
				})
		window.addEventListener(
			'keyup', 
			(event) => { 
				if(document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return 
				this.#input[event.key] = false
				})

		this.#aspectRatio = canvas.width / canvas.height
		this.loadDefaultValues()
	}

	set aspectRatio(value) { 
		this.#aspectRatio = value
		this.#perspHeight = this.#perspWidth / this.#aspectRatio
		this.#orthoHeight = this.#orthoWidth / this.#aspectRatio
		this.#updatePerspectiveMatrix()
		this.#updateOrthogonalMatrix()
	}
	get fov() { return this.#hFov }
	set fov(value) { // Updates Perspective mode width and height
		this.#hFov = value
		this.#perspWidth = 2 * this.#near * Math.tan((this.#hFov / 2) * (Math.PI / 360.0))
		this.#perspHeight = this.#perspWidth / this.#aspectRatio
		this.#updatePerspectiveMatrix()
	}
	get orthoWidth() { return this.#orthoWidth }
	set orthoWidth(value) {	// Updates Orthogonal mode width and height
		if (value < 1.0) value = 1.0		// Min
		if (value > 100.0) value = 100.0	// Max
		this.#orthoWidth = value
		this.#orthoHeight = this.#orthoWidth / this.#aspectRatio
		this.#updateOrthogonalMatrix()
		if (this.updateListener) this.updateListener(this.#orthoWidth)	// Hacky way to update UI
	}
	get transform() { return this.#transform }
	get viewRotationMatrix() { return this.#viewRotationMatrix }		// Used in UI gizmo rotation
	get viewMatrix() { return this.#viewMatrix }
	get projectionMatrix() {
		if (this.orthogonalMode) return this.#orthogonalMatrix
		else return this.#perspectiveMatrix
	}

	loadDefaultValues() {
		this.#transform.position = new Vector3(4.0, 5.0, 10.0)
		this.#updateViewTranslationMatrix()
		this.#transform.rotation = new Vector3(-20.0, 20.0, 0.0)
		this.#updateViewRotationMatrix()
		this.#updateViewMatrix()

		this.fov = 80.0
		this.orthoWidth = 25.0
		this.speed = 0.6
		this.sensitivity = 3.0
	}

	update(deltaTime) {
		// Camera rotation
		let rotation
		// Mouse input
		if (this.#input[2] && this.#input['mousemove']) {
			rotation = Vector3.Zero()
			rotation.y += this.#input['mousemove'][0]
			rotation.x += this.#input['mousemove'][1]
			this.#input['mousemove'] = null

		}
		// Keyboard input. 
		if (this.#input['ArrowUp'] || this.#input['ArrowDown'] || this.#input['ArrowLeft'] || this.#input['ArrowRight']) {
			const keyboardRotation = Vector3.Zero()
			if (this.#input['ArrowUp']) keyboardRotation.x += 1
			if (this.#input['ArrowDown']) keyboardRotation.x -= 1
			if (this.#input['ArrowLeft']) keyboardRotation.y += 1
			if (this.#input['ArrowRight']) keyboardRotation.y -= 1
			keyboardRotation.normalize().scale(10)	// Arbitrary hard-coded value to make it more similar to mouse sensitivity

			if (!rotation) rotation = Vector3.Zero()
			rotation.add(keyboardRotation)
		}

		if (rotation) {
			this.#transform.rotation.add(rotation.scale(deltaTime * this.sensitivity))
			this.#updateViewRotationMatrix()
		}

		// Camera translation/zoom
		let translation
		// Mouse Camera movement
		if(this.#input[0] && this.#input['mousemove']) {
			translation = Vector3.Zero()
			translation.x = -this.#input['mousemove'][0]
			translation.y = this.#input['mousemove'][1]
			this.#input['mousemove'] = null
		}
		if (this.#input['mousewheel']) {
			if (!translation) translation = Vector3.Zero()
			translation.z = this.#input['mousewheel']
			this.#input['mousewheel'] = null
		}
		// Keyboard Camera movement
		if (this.#input['w'] || this.#input['a'] || this.#input['s'] || this.#input['d'] || this.#input['e'] || this.#input['q']) {
			const keyboardTranslation = Vector3.Zero()
			if (this.#input['w']) keyboardTranslation.z -= 1
			if (this.#input['s']) keyboardTranslation.z += 1
			if (this.#input['a']) keyboardTranslation.x -= 1
			if (this.#input['d']) keyboardTranslation.x += 1
			if (this.#input['q']) keyboardTranslation.y -= 1
			if (this.#input['e']) keyboardTranslation.y += 1
			keyboardTranslation.normalize().scale(20) // Arbitrary hard-coded value to make it more similar to mouse sensitivity
			
			if (!translation) translation = Vector3.Zero()
			translation.add(keyboardTranslation)
		}

		if (translation) {
			translation.scale(this.speed * deltaTime)
			if (this.orthogonalMode) {
				this.orthoWidth = this.#orthoWidth + translation.z // Orthogonal mode Width "zoom"
				translation.z = 0
			}
			translation.rotateByMatrix(this.#viewRotationMatrix)	// To move in Camera local space
			this.#transform.position.add(translation)
			this.#updateViewTranslationMatrix()
		}
	}

	#updateViewTranslationMatrix() { 
		this.#viewTranslationMatrix.setTranslation(Vector3.Negate(this.#transform.position))	// NEGATE of Camera's position
		this.#updateViewMatrix()
	}

	#updateViewRotationMatrix() {
		this.#viewRotationMatrix = Mat4.Transpose(Mat4.FromRotationVector(this.#transform.rotation))	// TRANSPOSE of Camera's rotation
		this.#updateViewMatrix()
	}

	#updateViewMatrix() { this.#viewMatrix = Mat4.PreMultiply(this.#viewRotationMatrix, this.#viewTranslationMatrix) }

	#updatePerspectiveMatrix() {
		// Simplified matrix form for symmetric projection (right = -left and top = -bottom)
		this.#perspectiveMatrix.set(0,0, this.#near / (this.#perspWidth / 2.0))
		this.#perspectiveMatrix.set(1,1, this.#near / (this.#perspHeight / 2.0))
		this.#perspectiveMatrix.set(2,2, - (this.#far + this.#near) / (this.#far - this.#near))
		this.#perspectiveMatrix.set(2,3, - (2.0 * this.#far * this.#near) / (this.#far - this.#near))
		this.#perspectiveMatrix.set(3,2, - 1.0)
	}

	#updateOrthogonalMatrix() {
		// Simplified matrix form for symmetric projection (right = -left and top = -bottom)
		this.#orthogonalMatrix.set(0,0, 1.0 / (this.#orthoWidth / 2.0))
		this.#orthogonalMatrix.set(1,1, 1.0 / (this.#orthoHeight / 2.0))
		this.#orthogonalMatrix.set(2,2, -2.0 / (this.#far - this.#near))
		this.#orthogonalMatrix.set(2,3, -(this.#far + this.#near) / (this.#far - this.#near))
		this.#orthogonalMatrix.set(3,3, 1.0)
	}
}