import { Vector3 } from "./vector3.js";

export class Mat4 {	
	
	constructor() { this.values = new Float32Array(16); }

	// Row-major implementation
	get(r, c) { return this.values[r * 4 + c]; }

	set(r, c, value) { this.values[r * 4 + c] = value; }

	//// IN-PLACE OPERATIONS /////

	add(M) { for (let i = 0; i < 16; i++) this.values[i] += M.values[i] }

	setTranslation(v) {
		this.set(0,3, v.x);
		this.set(1,3, v.y);
		this.set(2,3, v.z);
	}

	// Extrinsic (w.r.t. parent's axis) rotation on X, Y, then Z axis order.
	setRotation(v) {
		v = Vector3.Scale(v, Math.PI / 180); // Convert to radians
		const sinX = Math.sin(v.x);
		const cosX = Math.cos(v.x);
		const sinY = Math.sin(v.y);
		const cosY = Math.cos(v.y);
		const sinZ = Math.sin(v.z);
		const cosZ = Math.cos(v.z);

		this.values.set([
			cosY * cosZ,	sinX * sinY * cosZ - sinZ * cosX,	cosX * sinY * cosZ + sinX * sinZ,	this.get(0,3),
			sinZ * cosY,	sinX * sinY * sinZ + cosZ * cosX,	cosX * sinY * sinZ - sinX * cosZ,	this.get(1,3),
			-sinY,			sinX * cosY,						cosY * cosX,						this.get(2,3),
			this.get(3,0),	this.get(3,1), 						this.get(3,2), 						this.get(3,3)
		]);				
	}

	setScale(v) {
		this.set(0, 0, v.x);
		this.set(1, 1, v.y);
		this.set(2, 2, v.z);
	}

	//// MATRICES STATIC OPERATIONS ////

	static Transpose(M) {
		let result = Mat4.ZeroMatrix();
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				result.set(i, j, M.get(j, i));
			}
		}
		return result;
	}

	static Add(M1, M2) {
		let result = new Mat4();
		for (let i = 0; i < 16; i++) {
			result.values[i] = M1.values[i] + M2.values[i];
		}
		return result;
	}

	static PreMultiply(A, B) {
		let result = new Mat4()
		let sum
		for (let r = 0; r < 4; r++) {
			for (let c = 0; c < 4; c++) {
				sum = 0
				for (let k = 0; k < 4; k++) {
					sum += A.get(r,k) * B.get(k,c);
				}
				result.set(r,c, sum)
			}
		}
		return result;
	}

	//// SPECIAL MATRICES BUILDERS ////

	static IdentityMatrix() {
		let m = new Mat4()
		m.values.set([
			1, 0, 0, 0, 
			0, 1, 0, 0, 
			0, 0, 1, 0, 
			0, 0, 0, 1])
		return m
	}

	static ZeroMatrix() {
		let m = new Mat4()
		m.values.fill(0)
		return m
	}

	static FromTranslationVector(v) {
		let m = Mat4.IdentityMatrix()
		m.setTranslation(v)
		return m
	}

	static FromRotationVector(v) {
		const m = Mat4.IdentityMatrix()
		m.setRotation(v)
		return m
	}

	static FromScaleVector(v) {
		let m = Mat4.IdentityMatrix()
		m.setScale(v)
		return m
	}

	//// DEBUG ////

	toString() {
		let result = ""
		for (let i = 0; i < 16; i++) {
			result += this.values[i] + "  "
			if ((i+1) % 4 == 0) result += '\n'
		}
		return result
	}
}
