const resolveStringValue = (value: string, extension: string): number => {
  try {
    return Number(value.replace(extension, '') || 0)
  } catch (e) {
    console.error(e)
    return 0
  }
}

const calculatePixelValue = (
  input: string,
  calculation: (input: number) => number,
): string => {
  const num = resolveStringValue(input, 'px')
  return `${calculation(num)}px`
}

export default calculatePixelValue