import { useContext, useState } from "react"
import { SceneContext } from "../scene-context"
import white_delete from "./../assets/white_circle_x.png"
import white_collapse_arrows from "./../assets/white_collapse_arrows.png"
import white_expand_arrows from "./../assets/white_expand_arrows.png"

export function UI_HierarchyItem({obj, removeObject, setObjectParent, depth = 0}) {
	const { selectedObject, setSelectedObject, draggedObject, setDraggedObject } = useContext(SceneContext)
	const [collapsed, setCollapsed] = useState(true)

	let children = null
	let collapseButton =	// Hacky way to have empty space the same size as the icon button
			<img
			src={collapsed ? white_expand_arrows : white_collapse_arrows}
			className="icon-button"
			style={{opacity: "0%", cursor: "default"}}
			/>

	if (obj.children.length > 0) {
		children =
			<div className={collapsed ? "collapsible hidden" : "collapsible"}>
				<div 
				className={ obj === selectedObject ? "hierarchy-children-container selected collapsible-content" : "hierarchy-children-container collapsible-content"}
				>
					{obj.children.map((child) =>
						<UI_HierarchyItem 
						obj={child} 
						removeObject={removeObject} 
						setObjectParent={setObjectParent} 
						depth={depth + 1} 
						key={child.id} 
						/>
					)}
				</div>
			</div>

		collapseButton =
			<img
			onClick={handleToggleCollapsed}
			src={collapsed ? white_expand_arrows : white_collapse_arrows}
			className="icon-button"
			/>
	}

	return (
		<div className="hierarchy-item-container" style={depth === 0 ? {marginLeft: "0"} : {}}>
			<div 
			className={obj === selectedObject ? "hierarchy-selected-item" : "hierarchy-item" }
			onClick={() => setSelectedObject(obj)}
			draggable={true}
			onDragEnter={(e) => e.currentTarget.classList.add("hierarchy-item-drag-over")}
			onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
			onDragLeave={(e) => {if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.classList.remove("hierarchy-item-drag-over")}}
			onDragStart={handleOnDragStart}
			onDrop={handleOnDrop}
			>
				<div className="hierarchy-item-name">
					{obj.name}
				</div>
				<span className="hierarchy-item-type">{obj.typeName}</span>
				{collapseButton}
				<img 
				onClick={(e) => {e.stopPropagation(); removeObject(obj, true);}} 
				src={white_delete}
				className="icon-button"
				/>
			</div>
			{children}
		</div>
	)

	function handleToggleCollapsed(e) {
		e.stopPropagation()
		setCollapsed(!collapsed)
	}

	function handleOnDragStart(e) {
		e.dataTransfer.effectAllowed = "move"
		setDraggedObject(obj)
	}

	function handleOnDrop(e) {
		e.preventDefault()
		e.currentTarget.classList.remove("hierarchy-item-drag-over")
		setObjectParent(draggedObject, obj)
		setDraggedObject(null)
	}
}