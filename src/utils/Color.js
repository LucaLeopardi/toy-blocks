export function HexToRGB(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ] : null
}

export function RGBToHex(rgb) {
    let r = Math.round(rgb[0] * 255);
    let g = Math.round(rgb[1] * 255);
    let b = Math.round(rgb[2] * 255);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}