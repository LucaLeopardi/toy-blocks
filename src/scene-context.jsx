import { createContext, useReducer, useState } from "react"
import { RootObject } from "./object3d"

export const SceneContext = createContext()

export function SceneProvider({children}) {
	const [objectsRoot,] = useState(new RootObject())
	const [selectedObject, _setSelectedObject] = useState(null)
	const [draggedObject, setDraggedObject] = useState(null)
	const [, forceUpdate] = useReducer(x => x + 1, 0)

	function setSelectedObject(object) {
		if (object && object === selectedObject || object === objectsRoot) return
		objectsRoot.selected = false	// Deselects all
		if (object) object.selected = true
		_setSelectedObject(object)
	}

	return (
		<SceneContext.Provider value={{objectsRoot, selectedObject, setSelectedObject, draggedObject, setDraggedObject, forceUpdate}}>
			{children}
		</SceneContext.Provider>
	)
}