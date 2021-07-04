const joinClasses = (classes: (string | undefined)[]) => {
  const cache = {}
  return classes.reduce((classesString, className) => {
    if (!className || cache[className]) return classesString
    cache[className] = className
    return `${classesString} ${className}`
  }, '').trim()
}

export default joinClasses