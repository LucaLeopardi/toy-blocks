import { useEffect, useState } from "react"

export function UI_NumberField({value: initialValue, label, min=null, max=null, step=0.10, defaultValue=0.0, onChange=null, disabled=false}) {

	const [value, setValue] = useState(initialValue.toFixed(2))
	const [spinButtonDown, setSpinButtonDown] = useState(false)

	useEffect(() => setValue(initialValue.toFixed(2)), [initialValue])

	let colorTagStyle = {}
	switch (label) {
		case "X":
			colorTagStyle = {boxShadow: "3px 0 #FF0000CC"}
			break;
		case "Y":
			colorTagStyle = {boxShadow: "3px 0 #00FF00CC"}
			break;
		case "Z":
			colorTagStyle = {boxShadow: "3px 0 #0000FFCC"}
			break;
	}

	return (
		<div className='property-field' style={disabled ? {opacity: 0.6, backgroundColor: "transparent"} : {}}>
			<label htmlFor={label}>{label}</label>
			<input
				id={label} 
				type="number" 
				value={value}	// Round to second decimal
				step={step}
				onChange={(e) => handleChange(e.target.value)}
				onMouseDown={() => setSpinButtonDown(true)}
				onMouseUp={() => setSpinButtonDown(false)}
				onBlur={() => update(value)}
				onKeyUp={(e) => { 
					if (e.key === 'Enter') update(value)
					if(e.key === 'Escape') e.target.blur()
				}}
				disabled={disabled}
				style={colorTagStyle}
			/>
		</div>
	)

	function handleChange(n) {			
		setValue(n)						// Updates UI only,
		if (spinButtonDown) update(n)	// unless spin button is being pressed: in that case actual values is also updated
	}

	// Updates UI AND actual value
	function update(newValue) {
		newValue = parseFloat(newValue).toFixed(2)
		if (isNaN(newValue)) newValue = defaultValue
		if (min !== null && newValue < min) newValue = min
		if (max !== null && newValue > max) newValue = max
		setValue(newValue)								// Update UI
		if (onChange) onChange(parseFloat(newValue))	// Send update to parent Component
	}
}