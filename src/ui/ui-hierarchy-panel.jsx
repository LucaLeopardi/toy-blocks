import { useContext, useState } from "react"
import { SceneContext } from "../scene-context"
import { Cone, Cube, Cylinder, EmptyObject, Pyramid, Tetrahedron } from "../object3d"
import { Vector3 } from "../utils/vector3"
import { UI_HierarchyItem } from "./ui-hierarchy-item"
import white_arrow_up from "./../assets/white_arrow_up.png"

export function UI_HierarchyPanel({spawnObject, removeObject, setObjectParent}) {
	const { objectsRoot, draggedObject, setDraggedObject, setSelectedObject } = useContext(SceneContext)
	const [showNewObjectsPanel, setShowNewObjectsPanel] = useState(false)

	return (
		<div className='hierarchy-panel' onClick={() => setSelectedObject(null)}>
			<div className="header">Objects Hierarchy</div>
		
			{/* Root item */}
			<div className="hierarchy" onClick={(e) => e.stopPropagation()}>	
				<div 
				style={{padding: `5px`, borderRadius: "3px"}}
				onClick={() => setSelectedObject(null)}
				onDragEnter={(e) => e.currentTarget.classList.add("hierarchy-item-drag-over")}
				onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
				onDragLeave={(e) => e.currentTarget.classList.remove("hierarchy-item-drag-over")}
				onDrop={(e) => {
					e.preventDefault()
					e.currentTarget.classList.remove("hierarchy-item-drag-over")
					setObjectParent(draggedObject, objectsRoot)
					setDraggedObject(null)
				}}>
					<span style={{opacity: `30%`}}>Root</span>
				</div>

				{/* Sample scene button */}
				<div className={objectsRoot.children.length > 0 ? "collapsible hidden" : "collapsible"}>
					<div className="collapsible-content">
						<div 
						className="text-button"
						onClick={setUpSampleScene}>
							Open sample scene
						</div>
					</div>
				</div>
				
				{/* Actual hierarchy items */}
				{objectsRoot.children.map((child) => 
					<UI_HierarchyItem 
					obj={child}
					removeObject={removeObject} 
					setObjectParent={setObjectParent} 
					key={child.id} 
					/>)}
			</div>

			<hr />
			{/* New Objects options */}
			<div style={{padding: "15px"}} onClick={(e) => e.stopPropagation()}>
				<div className="text-button" onClick={() => setShowNewObjectsPanel(!showNewObjectsPanel)}>
					<img src={white_arrow_up} loading="eager" className={showNewObjectsPanel ? "icon" : "icon upside-down"}/>
					<span>Add object</span>
					<img src={white_arrow_up} loading="eager" className={showNewObjectsPanel ? "icon" : "icon upside-down"}/>
				</div>

				<div 
					className={showNewObjectsPanel ? "collapsible secondary-panel" : "collapsible hidden secondary-panel"} 
					style={{borderRadius: "3px"}}
				>
					<div className="collapsible-content" style={{margin: "5px 10px"}}>
						<div className="text-button small" onClick={() => spawnObject(Cube)}>Cube</div>
						<div className="text-button small" onClick={() => spawnObject(Pyramid)}>Pyramid</div>
						<div className="text-button small" onClick={() => spawnObject(Tetrahedron)}>Tetrahedron</div>
						<div className="text-button small" onClick={() => spawnObject(Cone)}>Cone</div>
						<div className="text-button small" onClick={() => spawnObject(Cylinder)}>Cylinder</div>
						<div className="text-button small" onClick={() => spawnObject(EmptyObject)}>Empty Object</div>
					</div>
				</div>
			</div>
		</div>
	)

	function setUpSampleScene() {
		let tempObj, parentObj

		const chairRoot = spawnObject(EmptyObject)
		chairRoot.position = new Vector3(-2.0, 0.0, -32.0)
		chairRoot.rotation = new Vector3(0.0, 20.0, 0.0)
		chairRoot.name = "Chair"

		tempObj = spawnObject(EmptyObject)
		tempObj.position = new Vector3(0.0, 1.0, 0,0)
		tempObj.scale = new Vector3(0.2, 2.0, 0.2)
		tempObj.name = "Legs"
		setObjectParent(tempObj, chairRoot)
		parentObj = tempObj

		tempObj = spawnObject(Cube)
		tempObj.position = new Vector3(-4.0, 0.0, -4.0)
		tempObj.color = [0.9, 0.3, 0.3]
		tempObj.name = "Leg 1"
		setObjectParent(tempObj, parentObj)

		tempObj = spawnObject(Cube)
		tempObj.position = new Vector3(4.0, 0.0, -4.0)
		tempObj.color = [0.9, 0.3, 0.3]
		tempObj.name = "Leg 2"
		setObjectParent(tempObj, parentObj)

		tempObj = spawnObject(Cube)
		tempObj.position = new Vector3(4.0, 0.0, 4.0)
		tempObj.color = [0.9, 0.3, 0.3]
		tempObj.name = "Leg 3"
		setObjectParent(tempObj, parentObj)

		tempObj = spawnObject(Cube)
		tempObj.position = new Vector3(-4.0, 0.0, 4.0)
		tempObj.color = [0.9, 0.3, 0.3]
		tempObj.name = "Leg 4"
		setObjectParent(tempObj, parentObj)

		tempObj = spawnObject(Cube)
		tempObj.position = new Vector3(0.0, 2.0, 0.0)
		tempObj.scale = new Vector3(2.1, 0.2, 2.1)
		tempObj.color = [1.0, 0.3, 0.3]
		tempObj.name = "Seat"
		setObjectParent(tempObj, chairRoot)

		tempObj = spawnObject(Cube)
		tempObj.position = new Vector3(0.0, 4.0, -1.0)
		tempObj.rotation = new Vector3(80.0, 0.0, 0.0)
		tempObj.scale = new Vector3(2.0, 0.2, 1.2)
		tempObj.color = [1.0, 0.3, 0.3]
		tempObj.name = "Back"
		setObjectParent(tempObj, chairRoot)
		parentObj = tempObj

		tempObj = spawnObject(Cube)
		tempObj.position = new Vector3(0.4, -1.0, 0.5)
		tempObj.scale = new Vector3(0.1, 1.0, 2.2)
		tempObj.color = [1.0, 0.3, 0.3]
		tempObj.name = "Back support 1"
		setObjectParent(tempObj, parentObj)

		tempObj = spawnObject(Cube)
		tempObj.position = new Vector3(-0.4, -1.0, 0.5)
		tempObj.scale = new Vector3(0.1, 1.0, 2.2)
		tempObj.color = [1.0, 0.3, 0.3]
		tempObj.name = "Back support 2"
		setObjectParent(tempObj, parentObj)


		const hourglassRoot = spawnObject(EmptyObject)
		hourglassRoot.position = new Vector3(2.0, 0.0, -30.0)
		hourglassRoot.rotation = new Vector3(-20.0, 0.0, -30.0)
		hourglassRoot.name = "Hourglass"

		tempObj = spawnObject(Cylinder)
		tempObj.scale = new Vector3(1.0, 0.05, 1.0)
		tempObj.color = [0.9, 0.7, 0.4]
		tempObj.name = "Base"
		setObjectParent(tempObj, hourglassRoot)
		parentObj = tempObj

		tempObj = spawnObject(Cone)
		tempObj.position = new Vector3(0.0, 7.5, 0.0)
		tempObj.scale = new Vector3(0.7, 14.0, 0.7)
		tempObj.color = [0.3, 0.9, 0.9]
		tempObj.name = "Lower glass"
		setObjectParent(tempObj, parentObj)

		tempObj = spawnObject(Cylinder)
		tempObj.position = new Vector3(0.0, 1.4, 0.0)
		tempObj.scale = new Vector3(1.0, 0.05, 1.0)
		tempObj.rotation = new Vector3(180.0, 0.0, 0.0)
		tempObj.color = [1.0, 0.8, 0.4]
		tempObj.name = "Top"
		setObjectParent(tempObj, hourglassRoot)
		parentObj = tempObj

		tempObj = spawnObject(Cone)
		tempObj.position = new Vector3(0.0, 7.5, 0.0)
		tempObj.scale = new Vector3(0.7, 14.0, 0.7)
		tempObj.color = [0.3, 0.9, 0.9]
		tempObj.name = "Upper glass"
		setObjectParent(tempObj, parentObj)

		tempObj = spawnObject(Cylinder)
		tempObj.position = new Vector3(0.42, 0.7, 0.0)
		tempObj.scale = new Vector3(0.1, 1.4, 0.1)
		tempObj.color = [0.9, 0.7, 0.4]
		tempObj.name = "Arm 1"
		setObjectParent(tempObj, hourglassRoot)

		tempObj = spawnObject(Cylinder)
		tempObj.position = new Vector3(-0.42, 0.7, 0.0)
		tempObj.scale = new Vector3(0.1, 1.4, 0.1)
		tempObj.color = [0.9, 0.7, 0.4]
		tempObj.name = "Arm 2"
		setObjectParent(tempObj, hourglassRoot)
		
		function spawnBuilding() {
			const buildingRoot = spawnObject(EmptyObject)
			buildingRoot.name = "Building"

			tempObj = spawnObject(Cube)
			setObjectParent(tempObj, buildingRoot)
			tempObj.position = new Vector3(0.0, -0.05, 0.0)
			tempObj.scale = new Vector3(10.0, 0.1, 5.0)
			tempObj.color = [0.8, 0.8, 0.8]
			tempObj.name = "Base"
			
			tempObj = spawnObject(Cube)
			setObjectParent(tempObj, buildingRoot)
			tempObj.position = new Vector3(0.0, 1.0, -1.5)
			tempObj.scale = new Vector3(9.0, 2.0, 2.0)
			tempObj.color = [0.8, 0.8, 0.8]
			tempObj.name = "Main structure"
			parentObj = tempObj
			
			tempObj = spawnObject(Cylinder)
			setObjectParent(tempObj, parentObj)
			tempObj.position = new Vector3(0.0, 0.6, 0.0)
			tempObj.rotation = new Vector3(90.0, 0.0, 0.0)
			tempObj.scale = new Vector3(1.0, 0.95, 2.0)
			tempObj.color = [1.0, 1.0, 1.0]
			tempObj.name = "Dome"
			
			tempObj = spawnObject(Cube)
			setObjectParent(tempObj, parentObj)
			tempObj.position = new Vector3(0.0, 0.55, 0.5)
			tempObj.scale = new Vector3(1.0, 0.1, 2.0)
			tempObj.color = [1.0, 1.0, 1.0]
			tempObj.name = "Roof"
			parentObj = tempObj
			
			tempObj = spawnObject(Pyramid)
			setObjectParent(tempObj, parentObj)
			tempObj.position = new Vector3(0.0, 4.0, -0.01)
			tempObj.scale = new Vector3(0.4, 7.1, 0.1)
			tempObj.color = [1.0, 1.0, 1.0]
			tempObj.name = "Decoration"
			
			const columns = spawnObject(EmptyObject)
			setObjectParent(columns, buildingRoot)
			columns.position = new Vector3(0.0, 0.0, 1.0)
			columns.name = "Columns"

			for (let i = 0; i < 6; i++) {
				tempObj = spawnObject(Cylinder)
				setObjectParent(tempObj, columns)
				tempObj.position = new Vector3(-3.75 + i * 1.5, 0.9, 0.0)
				tempObj.scale = new Vector3(0.5, 1.5, 0.5)
				tempObj.color = [0.9, 0.9, 0.9]
				tempObj.name = "Column " + (i + 1)
				parentObj = tempObj
				
				tempObj = spawnObject(Cube)
				setObjectParent(tempObj, parentObj)
				tempObj.position = new Vector3(0.0, -0.55, 0.0)
				tempObj.scale = new Vector3(1.0, 0.1, 1.0)
				tempObj.color = [0.9, 0.9, 0.9]
				tempObj.name = "Column base " + (i + 1)
				
				tempObj = spawnObject(Cube)
				setObjectParent(tempObj, parentObj)
				tempObj.position = new Vector3(0.0, 0.5, 0.0)
				tempObj.scale = new Vector3(1.0, 0.1, 1.0)
				tempObj.color = [0.8, 0.8, 0.8]
				tempObj.name = "Column top " + (i + 1)
				parentObj = tempObj

				tempObj = spawnObject(Pyramid)
				setObjectParent(tempObj, parentObj)
				tempObj.rotation = new Vector3(180.0, 0.0, 0.0)
				tempObj.scale = new Vector3(1.2, 5.0, 1.2)
				tempObj.color = [1.0, 1.0, 1.0]
				tempObj.name = "Column flare " + (i + 1)
			}

			return buildingRoot
		}

		tempObj = spawnBuilding()
		tempObj.position = new Vector3(-20.0, 0.0, -30.0)
		tempObj.rotation = new Vector3(0.0, 90.0, 0.0)
		tempObj.scale = new Vector3(5.0, 5.0, 5.0)
		tempObj.name = "Building 1"

		tempObj = spawnBuilding()
		tempObj.position = new Vector3(20.0, 0.0, -30.0)
		tempObj.rotation = new Vector3(0.0, -90.0, 0.0)
		tempObj.scale = new Vector3(5.0, 5.0, 5.0)
		tempObj.name = "Building 2"

		tempObj = spawnBuilding()
		tempObj.position = new Vector3(0.0, 0.0, -80.0)
		tempObj.scale = new Vector3(5.0, 5.0, 5.0)
		tempObj.name = "Building 3"
		
		setSelectedObject(null)
	}
}