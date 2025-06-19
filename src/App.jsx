import { useEffect, useRef, useState, useContext } from "react"
import { Shader } from "./shader.js"
import { Cube, Object3D, Cone, Cylinder } from "./object3d.js"
import { Vector3 } from "./utils/vector3.js"
import { Camera } from "./camera.js"
import { SceneRenderer } from "./scene-renderer.js"
import { UIRenderer } from "./ui-renderer.js"
import { UI_HierarchyPanel } from "./ui/ui-hierarchy-panel.jsx"
import { UI_ObjectPropertiesPanel } from "./ui/ui_object-properties-panel.jsx"
import { UI_CameraPanel } from "./ui/ui-camera-panel.jsx"
import { UI_SceneProperties } from "./ui/ui-scene-properties.jsx"
import { SceneContext } from "./scene-context.jsx"

export default function App() {
	/* Page elements */
	const [canvasElement, setCanvasElement] = useState(null)
	const [webGL, setWebGL] = useState(null)
	const renderingShouldStop = useRef(false)	// useRef to have changes reflected immediately
	/* App vars */
	const [camera, setCamera] = useState(null)
	const [sceneRenderer, setSceneRenderer] = useState(null)
	const [uiRenderer, setUiRenderer] = useState(null)

	const { objectsRoot, selectedObject, setSelectedObject, forceUpdate } = useContext(SceneContext)

	/* Debug */
	const [debugMode, setDebugMode] = useState(false)
	const [frameTime, setFrameTime] = useState(0.0)
	
	/* WebGL initialization on page load */
	useEffect( () => {
		initWebGL()
		return cleanup	// Cleanup function: set flag to exit mainLoop on App unmount
	}, [])
	/* App initialization */
	useEffect(() => { initApp() }, [canvasElement, webGL])	// Goofy lambda call to initApp() because it's async
	/* App execution  */
	useEffect(runApp, [camera, sceneRenderer, uiRenderer])

	/* Window resize handling */
	useEffect(() => {
 		const handleResize = () => {
			if (!webGL || !camera || !canvasElement) return

			canvasElement.width = canvasElement.clientWidth
			canvasElement.height = canvasElement.clientHeight
			camera.aspectRatio = canvasElement.width / canvasElement.height
			uiRenderer.updateUiProjectionMatrix()								// Updates UI projection matrix
			webGL.viewport(0, 0, canvasElement.width, canvasElement.height)
		}

		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);	// Cleanup function to remove the event listener when the component unmounts
	}, [canvasElement, webGL, camera]);

	return (
		<div className='main-window'>
			<div className='left-panel'>
				<UI_HierarchyPanel spawnObject={spawnObject} removeObject={removeObject} setObjectParent={setObjectParent}/>
				<UI_SceneProperties renderer={sceneRenderer} />
			</div>
			
			<canvas id="webgl-canvas" className="webgl-canvas">
				<p>Se leggi questo testo, Canvas HTML non sta funzionando correttamente!</p>
			</canvas>
			
			<div className='right-panel'>
				<UI_ObjectPropertiesPanel />
				<UI_CameraPanel camera={camera} />
			</div>
			
			{debugMode ? 
				<div style={{position: "fixed", top: "10px", left: "inherit", zIndex: "100"}}>
					Frame-time: {frameTime} ms ({Math.floor(1000 / frameTime)} FPS) <br />
					Num. of root Objects: {objectsRoot.children.length}
				</div>
			:
			<></>
			}
		</div>
	)


	function initWebGL() {
		if (canvasElement && webGL) return	// Check if already initialized in previous App mount

		const canvas = document.getElementById('webgl-canvas')
		if (!canvas) throw new Error('MAIN:: webgl-canvas HTML element not found')
		const gl = canvas.getContext('webgl2')
		if (!gl) throw new Error('MAIN:: WebGL2 not supported by browser')
		setCanvasElement(canvas)
		setWebGL(gl)
	}

	async function initApp() {
		if (!canvasElement || !webGL) return	// Previous initialization step error
		if (camera && sceneRenderer && uiRenderer) return			// Check if already initialized in previous App mount

		canvasElement.width = canvasElement.clientWidth		// Override HTML canvas size with size set in CSS
		canvasElement.height = canvasElement.clientHeight
		webGL.clear(webGL.COLOR_BUFFER_BIT | webGL.DEPTH_BUFFER_BIT)

		webGL.enable(webGL.DEPTH_TEST)
		webGL.enable(webGL.CULL_FACE)
		webGL.cullFace(webGL.BACK)
		webGL.frontFace(webGL.CCW)
		webGL.enable(webGL.BLEND)
		webGL.blendFunc(webGL.SRC_ALPHA, webGL.ONE_MINUS_SRC_ALPHA)

		//// SHADER, CAMERA, RENDERER SETUP ////
		const blinnPhongShader = await Shader.create(webGL, './glsl/blinn-phong.vert', './glsl/blinn-phong.frag')
		const unlitShader = await Shader.create(webGL, './glsl/unlit.vert', './glsl/unlit.frag')
		// Goofy temp vars to use immediately, as setCamera() and setRenderer() are not immediate
		const cam = new Camera(canvasElement)
		const sceneRend = new SceneRenderer(webGL, blinnPhongShader, cam)
		const uiRend = new UIRenderer(webGL, unlitShader,cam)
		setCamera(cam)
		setSceneRenderer(sceneRend)
		setUiRenderer(uiRend)
	}

	function runApp() {
		if (!camera || !sceneRenderer || !uiRenderer || !webGL) return	// Error in previous initialization steps

		const compassGizmo = setUpCompassGizmo(webGL)
		const directionalLightGizmo = setUpDirectionalLightGizmo(webGL)

		let lastTime = performance.now()
		renderingLoop()

		function renderingLoop() {
			if (renderingShouldStop.current) {
				cleanup()
				return
			}

			const deltaTime = (performance.now() - lastTime) / 1000.0
			lastTime = performance.now()
			setFrameTime(deltaTime * 1000)

			// Draw scene
			camera.update(deltaTime)
			sceneRenderer.clear()
			sceneRenderer.bindResources()
			webGL.viewport(0, 0, canvasElement.width, canvasElement.height)
			sceneRenderer.draw(objectsRoot)
			// Draw gizmo
			uiRenderer.clear()																	// Only clears depth buffer, not color buffer - to draw on top of scene 
			uiRenderer.bindResources()
			webGL.viewport(canvasElement.width - 150, canvasElement.height - 150, 150, 150)		// Hardcoded compass gizmo viewport size
			uiRenderer.draw(compassGizmo)
			updateDirectionalLightGizmo(directionalLightGizmo, sceneRenderer.lightDirection)
			webGL.viewport(0, canvasElement.height -150, 150, 150)								// Hardcoded light gizmo viewport size
			uiRenderer.draw(directionalLightGizmo)

			requestAnimationFrame(renderingLoop)
		}
	}

	// Handles useRef variables on App unmount
	function cleanup() {
		renderingShouldStop.current = false	// Reset renderingLoop flag for next App mount
	}

	function spawnObject(objectClass) {
		if (!webGL) throw new Error("spawnObject :: WebGL context not initialized")
		if (!(objectClass.prototype instanceof Object3D)) throw new Error("spawnObject :: Invalid object class: " + objectClass)

		const newObject = new objectClass(webGL)
		newObject.name = "New " + newObject.typeName
		newObject.parent = objectsRoot
		objectsRoot.children.push(newObject)
		setSelectedObject(newObject)
		forceUpdate()

		return newObject
	}

	function removeObject(object, deleteBuffers = false) {
		if (!object || object === objectsRoot) return
		if (selectedObject === object) setSelectedObject(null)

		for (const child of object.children) removeObject(child, deleteBuffers)
		object.parent.children = object.parent.children.filter(child => child !== object)
		if (deleteBuffers) object.delete()

		forceUpdate()
	}

	function setObjectParent(object, newParent) {
		if (!object || !newParent || object.parent === newParent) return
		if (checkTargetInChildren(newParent, object)) return

		if (object.parent) object.parent.children = object.parent.children.filter(child => child !== object)
		object.parent = newParent
		newParent.children.push(object)
		
		setSelectedObject(object)
		forceUpdate()
	}

	function checkTargetInChildren(target, object) {
		if (object === target) return true
		if (target === objectsRoot || !target.parent) return false
		return checkTargetInChildren(target.parent, object)
	}

	function setUpCompassGizmo(gl) {
		if (!gl) throw new Error("setUpCompassGizmo :: WebGL context not initialized")
		const root = new Cube(gl)
		root.color = [0.9, 0.9, 0.9]
		// X axis
		const xAxis = new Cylinder(gl)
		xAxis.position = new Vector3(1.0, 0.0, 0.0)
		xAxis.rotation = new Vector3(0.0, 0.0, -90.0)
		xAxis.scale = new Vector3(0.5, 1.0, 0.5)
		xAxis.color = [0.7, 0.0, 0.0]
		setObjectParent(xAxis, root)
		const xArrow = new Cone(gl)
		xArrow.position = new Vector3(2.0, 0.0, 0.0)
		xArrow.rotation = new Vector3(0.0, 0.0, -90.0)
		xArrow.color = [0.9, 0.0, 0.0]
		setObjectParent(xArrow, root)
		// Y axis
		const yAxis = new Cylinder(gl)
		yAxis.position = new Vector3(0.0, 1.0, 0.0)
		yAxis.scale = new Vector3(0.5, 1.0, 0.5)
		yAxis.color = [0.0, 0.7, 0.0]
		setObjectParent(yAxis, root)
		const yArrow = new Cone(gl)
		yArrow.position = new Vector3(0.0, 2.0, 0.0)
		yArrow.color = [0.0, 0.9, 0.0]
		setObjectParent(yArrow, root)
		//Z axis
		const zAxis = new Cylinder(gl)
		zAxis.position = new Vector3(0.0, 0.0, 1.0)
		zAxis.rotation = new Vector3(90.0, 0.0, 0.0)
		zAxis.scale = new Vector3(0.5, 1.0, 0.5)
		zAxis.color = [0.0, 0.0, 0.7]
		setObjectParent(zAxis, root)
		const zArrow = new Cone(gl)
		zArrow.position = new Vector3(0.0, 0.0, 2.0)
		zArrow.rotation = new Vector3(90.0, 0.0, 0.0)
		zArrow.color = [0.0, 0.0, 0.9]
		setObjectParent(zArrow, root)

		setSelectedObject(null)
		return root
	}

	function setUpDirectionalLightGizmo(gl) {
		if (!gl) throw new Error("setUpDirectionalLightGizmo :: WebGL context not initialized")
		const root = new Cube(gl)
		root.color = [0.9, 0.9, 0.9]
		const axis = new Cylinder(gl)
		setObjectParent(axis, root)
		axis.position = new Vector3(0.0, 1.0, 0.0)
		axis.scale = new Vector3(0.5, 1.0, 0.5)
		axis.color = [0.82, 0.72, 0.0]
		const arrow = new Cone(gl)
		setObjectParent(arrow, root)
		arrow.position = new Vector3(0.0, 2.0, 0.0)
		arrow.color = [0.9, 0.9, 0.0]

		setSelectedObject(null)
		return root
	}

	function updateDirectionalLightGizmo(gizmo, lightDirection) {
		if (!gizmo || !lightDirection) return
		const versor = Vector3.Normalize(lightDirection)
		gizmo.rotation = new Vector3(
			Math.acos(versor.y) * (180 / Math.PI),				// Gizmo is "aimed" by rotating around X axis
			Math.atan2(versor.x, versor.z) * (180 / Math.PI),	// and Y axis
			0.0
		)
	}
}