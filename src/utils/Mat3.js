export class Mat3 {	

    constructor() { this.values = new Float32Array(9) }

	// Row-major implementation
    get(r, c) { return this.values[r * 3 + c] }

    set(r, c, value) { this.values[r * 3 + c] = value }

    static FromMat4(M) {	// Copies top-left 3x3 submatrix
        let result = new Mat3();
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                result.set(r, c, M.get(c, r))
            }
        }
        return result;
    }


	//// SPECIAL MATRICES BUILDERS ////

    static IdentityMatrix() {
        let m = new Mat3()
        m.values.set([
			1, 0, 0, 
			0, 1, 0, 
			0, 0, 1])
        return m
    }

    static ZeroMatrix() {
        let m = new Mat3()
        m.values.fill(0)
        return m
    }


	//// MATRICES OPERATIONS ////

    static Transpose(M) {
        let result = new Mat3()
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                result.set(r, c, M.get(r, c))
            }
        }
        return result
    }

    static Inverse(M) {
        let result = new Mat3();
        let det =
            M.get(0, 0) * (M.get(1, 1) * M.get(2, 2) - M.get(1, 2) * M.get(2, 1)) -
            M.get(0, 1) * (M.get(1, 0) * M.get(2, 2) - M.get(1, 2) * M.get(2, 0)) +
            M.get(0, 2) * (M.get(1, 0) * M.get(2, 1) - M.get(1, 1) * M.get(2, 0));

        if (det === 0) throw new Error("Mat3::Inverse() matrix is not invertible");

        let invDet = 1 / det;

		result.values.set([
			(M.get(1, 1) * M.get(2, 2) - M.get(1, 2) * M.get(2, 1)) * invDet, // [0, 0]
			(M.get(0, 2) * M.get(2, 1) - M.get(0, 1) * M.get(2, 2)) * invDet, // [0, 1]
			(M.get(0, 1) * M.get(1, 2) - M.get(0, 2) * M.get(1, 1)) * invDet, // [0, 2]

			(M.get(1, 2) * M.get(2, 0) - M.get(1, 0) * M.get(2, 2)) * invDet, // [1, 0]
			(M.get(0, 0) * M.get(2, 2) - M.get(0, 2) * M.get(2, 0)) * invDet, // [1, 1]
			(M.get(0, 2) * M.get(1, 0) - M.get(0, 0) * M.get(1, 2)) * invDet, // [1, 2]
		
			(M.get(1, 0) * M.get(2, 1) - M.get(1, 1) * M.get(2, 0)) * invDet, // [2, 0]
			(M.get(0, 1) * M.get(2, 0) - M.get(0, 0) * M.get(2, 1)) * invDet, // [2, 1]
			(M.get(0, 0) * M.get(1, 1) - M.get(0, 1) * M.get(1, 0)) * invDet  // [2, 2]
		]);

        return result;
    }
}