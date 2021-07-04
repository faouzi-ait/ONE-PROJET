
const getGridClass = (numberOfItems: number) => {
  let gridClass = ''
  switch(numberOfItems) {
    case 2:
      gridClass = 'two'
      break;
    case 3:
      gridClass = 'three'
      break;
    case 4:
      gridClass = 'four'
      break;
    case 5:
      gridClass = 'five'
      break;
    default:
      gridClass = ''
  }
  return gridClass
}

export default getGridClass