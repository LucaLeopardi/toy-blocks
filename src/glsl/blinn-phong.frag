#version 300 es
precision mediump float;


#define K_SPECULAR 0.2

uniform mat4 u_viewMatrix;

uniform vec3 u_color;
uniform float u_diffuse;
uniform vec3 u_ambientColor;
uniform vec3 u_directionToLight;

in vec4 position;
in vec4 viewSpacePosition;
in vec3 normal;
in vec3 cameraDirection;

out vec4 color;

void main() {
	// Ambient light
	float ambient = 1.0 - u_diffuse;
	color = vec4(0.7 * ambient * u_color + 0.3 * ambient * u_ambientColor, 1.0);

	// Directional light
	vec3 lightVersor = normalize((u_viewMatrix * vec4(normalize(u_directionToLight), 0.0)).xyz);		// Light versor in view space
	float lambertCoeff = max(dot(lightVersor, normal), 0.0);
	// Only add diffuse and specular components if not in shadow
	if (lambertCoeff > 0.0) {	
		vec3 halfwayVersor = normalize(lightVersor + cameraDirection);
		float specularAngle = max(dot(halfwayVersor, normal), 0.0);
		float specularCoeff = pow(specularAngle, 40.0);	// Hardcoded shininess

		vec3 diffuseComponent = lambertCoeff * u_color;
		vec3 specularComponent = specularCoeff * vec3(1.0, 1.0, 1.0);

		color += vec4(u_diffuse * diffuseComponent + K_SPECULAR * specularComponent, 1.0);
	}
	//color = vec4(normal, 1.0);	// For debugging
}