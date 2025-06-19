import { useState } from "react"
import { HexToRGB, RGBToHex } from "../utils/color"
import { UI_Vector3 } from "./ui-vector3"
import white_arrow_up from "./../assets/white_arrow_up.png"


export function UI_SceneProperties({renderer}) {
	if (!renderer || !renderer?.gl) return null

	const [showPanel, setShowPanel] = useState(false)
	const [backgroundColor, setBackgroundColor] = useState(RGBToHex(renderer.backgroundColor))
	const [spotlightStrength, setSpotlightStrength] = useState(renderer.spotlightStrength)

	return (
		<div className="scene-properties-panel secondary-panel">
			<div onClick={() => setShowPanel(!showPanel)} className="text-button header">
				<img src={white_arrow_up} loading="eager" className={showPanel ? "icon upside-down" : "icon"}/>
				<div>Scene Properties</div>
				<img src={white_arrow_up} loading="eager" className={showPanel ? "icon upside-down" : "icon"}/>
			</div>

			<div className={showPanel ? "collapsible" : "collapsible hidden"}>
				<div className="collapsible-content">
					<div style={{margin: "8px"}}>
						<div className="property-field">
							<label htmlFor="background-color">Ambient color</label>
							<input
								id="background-color"
								type="color" 
								value={backgroundColor} 
								onChange={handleBackgroundColorChange}
							/>
						</div>

						<div className="property-field">
							<label htmlFor="ambient-light">Ambient light</label>
							<input 
								id="ambient-light"
								type="range"
								value={1.0 - spotlightStrength}
								min={0.1}
								max={0.9}
								step={0.05}
								onChange={handleAmbientLightChange}
							/>
						</div>

						<div className="property-field">
							<label htmlFor="spotlight-strength">Spotlight strength</label>
							<input 
								id="spotlight-strength"
								type="range"
								value={spotlightStrength}
								min={0.1}
								max={0.9}
								step={0.05}
								onChange={handleSpotlightStrengthChange}
							/>
						</div>
				
						<UI_Vector3 title="Spotlight direction" vector={renderer.lightDirection} />	
					</div>
				</div>
			</div>
		</div>
	)

	function handleBackgroundColorChange(e) {
		renderer.backgroundColor = HexToRGB(e.target.value)
		setBackgroundColor(e.target.value)
	}

	function handleAmbientLightChange(e) {
		renderer.spotlightStrength = 1.0 - e.target.value
		setSpotlightStrength(renderer.spotlightStrength)
	}

	function handleSpotlightStrengthChange(e) {
		renderer.spotlightStrength = e.target.value
		setSpotlightStrength(renderer.spotlightStrength)
	}
}