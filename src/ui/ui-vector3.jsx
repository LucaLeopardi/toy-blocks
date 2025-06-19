import { UI_NumberField } from "./ui-number-field";

export function UI_Vector3({title = "", vector: vec, positiveOnly=false, step=0.10, defaultValue=0.0, onChange=null}) {

    return (
		<div className="property-field">
			<label htmlFor={title + "-vector"}>{title}</label>
			<div id={title + "-vector"} className='ui-vector3'>
				<UI_NumberField 
					value={vec.x} 
					label="X" 
					min={positiveOnly? step : null}
					step={step}
					defaultValue={defaultValue} 
					onChange={(n) => {vec.x = n; if (onChange) onChange();}}
				/>
				<UI_NumberField 
					value={vec.y} 
					label="Y" 
					min={positiveOnly? step : null}
					step={step}
					defaultValue={defaultValue} 
					onChange={(n) => {vec.y = n; if (onChange) onChange();}} 
				/>
				<UI_NumberField 
					value={vec.z} 
					label="Z" 
					min={positiveOnly? step : null}
					step={step}
					defaultValue={defaultValue} 
					onChange={(n) => {vec.z = n; if (onChange) onChange();}} 
				/>
			</div>
		</div>
    )
}