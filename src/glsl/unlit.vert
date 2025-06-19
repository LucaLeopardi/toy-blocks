#version 300 es
precision mediump float;

layout(location = 0) in vec3 v_Position;
layout(location = 1) in vec3 v_Normal;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

out vec4 position;
out vec4 viewSpacePosition;


void main() {
	vec4 position = vec4(v_Position, 1.0);
	vec4 viewSpacePosition = u_viewMatrix * u_modelMatrix * position;

	gl_Position = u_projectionMatrix * viewSpacePosition;
}