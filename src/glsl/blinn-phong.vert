#version 300 es
precision mediump float;

layout(location = 0) in vec3 v_Position;
layout(location = 1) in vec3 v_Normal;

uniform mat3 u_normalMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

out vec4 position;
out vec4 viewSpacePosition;
out vec3 normal;
out vec3 cameraDirection;


void main() {
	position = vec4(v_Position, 1.0);
	viewSpacePosition = u_viewMatrix * u_modelMatrix * position;
	normal = normalize(u_normalMatrix * normalize(v_Normal));
	//normal = normalize(v_Normal);		// For debugging
	cameraDirection = -normalize(viewSpacePosition.xyz);

	gl_Position = u_projectionMatrix * viewSpacePosition;
}