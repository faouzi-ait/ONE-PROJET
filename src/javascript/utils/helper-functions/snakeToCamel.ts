const snakeToCamel = (
  input: string,
): string => {
  return input.replace(
    /([-_][a-z])/g,
    (group) => group.toUpperCase()
                    .replace('-', '')
                    .replace('_', ''))
}

export default snakeToCamel