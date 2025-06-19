import { useEffect, useState } from "react"
import { UI_NumberField } from "./ui-number-field"
import white_arrow_up from "./../assets/white_arrow_up.png"


export function UI_CameraPanel({camera}) {

	const [ showCameraPanel, setShowCameraPanel ] = useState(false)
	const [ cameraOrthogonalMode, setCameraOrthogonalMode ] = useState(null)
	const [ cameraFov, setCameraFov ] = useState(null)
	const [ cameraOrthoWidth, setCameraOrthoWidth ] = useState(null)
	const [ cameraSpeed, setCameraSpeed ] = useState(null)
	const [ cameraSensitivity, setCameraSensitivity ] = useState(null)

	useEffect(() => {
		if (!camera) return
		setCameraOrthogonalMode(camera.orthogonalMode)
		setCameraFov(camera.fov)
		setCameraOrthoWidth(camera.orthoWidth)
		setCameraSpeed(camera.speed)
		setCameraSensitivity(camera.sensitivity)
		camera.updateListener = (newOrthoWidth) => { setCameraOrthoWidth(newOrthoWidth) }
	}, [camera])
	
	if (cameraOrthogonalMode === null || !cameraFov || !cameraOrthoWidth || !cameraSpeed || !cameraSensitivity) return null

	return (
		<div className="camera-properties-panel secondary-panel">
			<div onClick={() => setShowCameraPanel(!showCameraPanel)} className="text-button header">
				<img src={white_arrow_up} loading="eager" className={showCameraPanel ? "icon upside-down" : "icon"}/>
				<div>Camera Properties</div>
				<img src={white_arrow_up} loading="eager" className={showCameraPanel ? "icon upside-down" : "icon"}/>
			</div>
			
			<div className={showCameraPanel ? "collapsible" : "collapsible hidden"}>
				<div className="collapsible-content">
					<div style={{margin: "8px"}}>

						<div style={{display: "flex", flexDirection: "row"}}>
							<div className={cameraOrthogonalMode ? "camera-mode-properties" : "camera-mode-properties camera-selected-mode-properties"}>
								{cameraOrthogonalMode ?
								<h5 onClick={handleToggleCameraMode} className="camera-mode-title">Perspective mode</h5>
								: 
								<h5 className="camera-mode-title camera-selected-mode-title">Perspective mode</h5>}

								<UI_NumberField 
									value={cameraFov} 
									label={"FOV"} 
									step={1.0} 
									min={20.0} 
									max={200.0} 
									defaultValue={80.0}
									onChange={ (newFov) => handleCameraFovChange(newFov)} 
									disabled={cameraOrthogonalMode}
								/>
							</div>

							<div className={cameraOrthogonalMode ? "camera-mode-properties camera-selected-mode-properties" : "camera-mode-properties"}>
								{cameraOrthogonalMode ?
								<h5 className="camera-mode-title camera-selected-mode-title">Orthogonal mode</h5>
								:
								<h5 onClick={handleToggleCameraMode} className="camera-mode-title">Orthogonal mode</h5>}

								<UI_NumberField 
									value={cameraOrthoWidth}
									label={"Width"} 
									step={0.5} 
									min={1.0} 
									max={100.0}
									defaultValue={25.0} 
									onChange={(newWidth) => handleCameraOrthoWidthChange(newWidth)}
									disabled={!cameraOrthogonalMode}
								/>
							</div>
						</div>

						<div className="property-field">
							<label htmlFor="cameraSpeed" style={{width:"30%"}}>Pan speed</label>
							<input 
								id="cameraSpeed" 
								value={cameraSpeed} 
								onChange={(e) => handleCameraSpeedChange(e.target.value)} 
								type="range" 
								min={0.1} 
								max={2.0} 
								step={0.1} 
							/>
							<label htmlFor="cameraSpeed" style={{width: "10%", textAlign: "end"}}>{cameraSpeed}</label>
						</div>

						<div className="property-field">
							<label htmlFor="cameraSensitivity" style={{width:"30%"}}>Sensitivity</label>
							<input 
								id="cameraSensitivity" 
								value={cameraSensitivity}
								onChange={(e) => handleCameraSensitivityChange(e.target.value)}
								type="range" 
								min={1.0} 
								max={10.0} 
								step={1.0}
							/>
							<label htmlFor="cameraSensitivity" style={{width: "10%", textAlign: "end"}}>{cameraSensitivity}</label>
						</div>

						<div onClick={handleCameraReset} className="text-button small">Reset default values</div>
					</div>
				</div>
			</div>
		</div>
	)


	function handleToggleCameraMode() {
		camera.orthogonalMode = !camera.orthogonalMode
		setCameraOrthogonalMode(camera.orthogonalMode)
	}

	function handleCameraFovChange(newFov) {
		camera.fov = newFov
		setCameraFov(newFov)
	}

	function handleCameraOrthoWidthChange(newWidth) {
		camera.orthoWidth = newWidth
		setCameraOrthoWidth(newWidth)
	}

	function handleCameraSpeedChange(newSpeed) {
		camera.speed = newSpeed
		setCameraSpeed(newSpeed)
	}

	function handleCameraSensitivityChange(newSensitivity) {
		camera.sensitivity = newSensitivity
		setCameraSensitivity(newSensitivity)
	}

	function handleCameraReset() {
		camera.loadDefaultValues()
		setCameraFov(camera.fov)
		setCameraOrthoWidth(camera.orthoWidth)
		setCameraSpeed(camera.speed)
		setCameraSensitivity(camera.sensitivity)
	}
}