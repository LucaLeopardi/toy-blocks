import { useContext, useEffect, useState } from "react"
import { SceneContext } from "../scene-context"
import { UI_Vector3 } from "./ui-vector3"
import { HexToRGB, RGBToHex } from "../utils/color"

export function UI_ObjectPropertiesPanel() {
	
	const {selectedObject, forceUpdate} = useContext(SceneContext)
	const [name, setName] = useState(null)
	const [color, setColor] = useState(null)
	const [position, setPosition] = useState(null)
	const [rotation, setRotation] = useState(null)
	const [scale, setScale] = useState(null)

	useEffect(() => {
		if (!selectedObject) return
		setName(selectedObject.name)
		setColor(RGBToHex(selectedObject.color))
		setPosition(selectedObject.position)
		setRotation(selectedObject.rotation)
		setScale(selectedObject.scale)
	}, [selectedObject])

	let content = (selectedObject === null || name === null || color === null || position === null || rotation === null || scale === null) ? 
		<p style={{opacity: 0.3, textAlign: "center"}}>No object selected</p>
		: 
		<div>

			<div className="property-field">
				<label htmlFor="object-name">Name</label>
				<input 
					id="object-name" 
					type='text' 
					value={name} 
					onChange={handleNameChange} 
					onKeyUp={(e) => { if (e.key === 'Enter' || e.key === 'Escape') e.target.blur() 
					}}/>
			</div>
		
			<div className="property-field">
				<label htmlFor="object-color">Color</label>
				<input 
					id="object-color" 
					type='color' 
					value={color} 
					onChange={handleColorChange} 
					onKeyUp={(e) => { if (e.key === 'Enter' || e.key === 'Escape') e.target.blur() 
					}}/>
			</div>

			<div>
				<UI_Vector3 
				title="Position" 
				vector={position} 
				onChange={() => selectedObject.updateModelMatrix()} 
				/>
				<UI_Vector3 
				title="Rotation" 
				vector={rotation} 
				step={1.0}
				onChange={() => selectedObject.updateModelMatrix()} 
				/>
				<UI_Vector3 
				title="Scale" 
				vector={scale}
				step={0.05}
				defaultValue={1.0}
				onChange={() => selectedObject.updateModelMatrix()} 
				positiveOnly={true} 
				/>
			</div>
		</div>

	return (
		<div className='object-properties-panel'>
			<div className="header">Object Properties</div>
			<div className='object-properties'>
			{content}
			</div>
		</div>
	)

	function handleNameChange(e) {
		if (!selectedObject || !e.target.value) return
		selectedObject.name = e.target.value
		setName(selectedObject.name)
		forceUpdate()	// Necessary to update the Hierarchy in real time
	}

	function handleColorChange(e) {
		if (!selectedObject || !e.target.value) return
		selectedObject.color = HexToRGB(e.target.value)
		setColor(e.target.value)
	}
} 