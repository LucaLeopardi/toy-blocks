export class Vector3 {
	#values = new Float32Array(3)

	constructor(x = 0, y = 0, z = 0) {
		this.#values[0] = x;
		this.#values[1] = y;
		this.#values[2] = z;
	}

	get x() { return this.#values[0]; }
	set x(value) { this.#values[0] = value; }

	get y() { return this.#values[1]; }
	set y(value) { this.#values[1] = value; }

	get z() { return this.#values[2]; }
	set z(value) { this.#values[2] = value; }

	get length() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z) }

	static Zero() { return new Vector3(0, 0, 0) }
	static One() { return new Vector3(1, 1, 1) }
	static Up() { return new Vector3(0, 1, 0) }
	static Down() { return new Vector3(0, -1, 0) }
	static Left() { return new Vector3(-1, 0, 0) }
	static Right() { return new Vector3(1, 0, 0) }
	static Forward() { return new Vector3(0, 0, -1) }
	static Backward() { return new Vector3(0, 0, 1) }

	// Static methods that return a new Vector3 instance without modifying the originals
	static Normalize(v) {
		if (v.length === 0) {
			console.warn('Vector3::Normalize():: Magnitude is 0')
			return new Vector3(0, 0, 0)
		}
		return new Vector3(v.x / v.length, v.y / v.length, v.z / v.length)
	}
	static Negate(v) { return new Vector3(-v.x, -v.y, -v.z) }
	static Add(v1, v2) { return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z) }
	static Subtract(v1, v2) { return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z) }
	static Scale(v, value) { return new Vector3(v.x * value, v.y * value, v.z * value) }
	static Dot(v1, v2) { return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z }
	static Cross(v1, v2) { 
		return new Vector3(
			v1.y * v2.z - v1.z * v2.y,
			v1.z * v2.x - v1.x * v2.z,
			v1.x * v2.y - v1.y * v2.x
		)
	}

	// Instance methods that modify the Vector3 instance

	negate() {
		this.x = -this.x
		this.y = -this.y
		this.z = -this.z
		return this
	}

	normalize() {
		if (this.length === 0) {
			console.warn('Vector3::normalize():: Magnitude is 0')
			return this
		}
		this.x /= this.length
		this.y /= this.length
		this.z /= this.length
		return this
	}

	add(v) { 
		this.x += v.x
		this.y += v.y
		this.z += v.z
		return this
	}

	subtract(v) {
		this.x -= v.x
		this.y -= v.y
		this.z -= v.z
		return this
	}

	scale(value) {
		this.x *= value
		this.y *= value
		this.z *= value
		return this
	}

	dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z }

	rotateByMatrix(M) {
		const x = this.x * M.get(0, 0) + this.y * M.get(1, 0) + this.z * M.get(2, 0);
		const y = this.x * M.get(0, 1) + this.y * M.get(1, 1) + this.z * M.get(2, 1);
		const z = this.x * M.get(0, 2) + this.y * M.get(1, 2) + this.z * M.get(2, 2);
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}

	//// DEBUG ////

	toString() {
		let str = ""
		str += this.x + " "
		str += this.y + " "
		str += this.z
		return str
	}
}