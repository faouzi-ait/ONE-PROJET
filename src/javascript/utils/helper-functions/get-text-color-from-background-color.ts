const getTextColorBasedOnBgColor = (
  bgColor: string,
  lightColor: string = '#FFFFFF',
  darkColor: string = '#000000'
) => {
  const color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  const extendedColor = color.length === 3 ? (color + color) : color
  const r = parseInt(extendedColor.substring(0, 2), 16); // hexToR
  const g = parseInt(extendedColor.substring(2, 4), 16); // hexToG
  const b = parseInt(extendedColor.substring(4, 6), 16); // hexToB
  return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186) ?
    darkColor : lightColor;
}

export default getTextColorBasedOnBgColor