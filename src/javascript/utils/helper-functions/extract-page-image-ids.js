/*
* params: pageContentBlocks: page['content-blocks'] from api query to pages
*
* return: array of unique page-image ids
*
*/

const extractPageImageIds = (pageContentBlocks) => {
  return pageContentBlocks?.reduce((idList, block) => {
    const idsToAdd = []
    if ((block.bgImage || {}).id) {
      idsToAdd.push(block.bgImage.id)
    }
    if ((block.mainImage || {}).id) {
      idsToAdd.push(block.mainImage.id)
    }
    if ((block.citationImage || {}).id) {
      idsToAdd.push(block.citationImage.id)
    }

    const getImageIds = (array = []) => {
      array.forEach(item => {
        idsToAdd.push(
          ...(item.imageIds || []),
          ...(item.logoIds || [])
        )
      })
    }

    getImageIds(block.slides)
    getImageIds(block.tabs)
    getImageIds(block.images)
    getImageIds(block.image)
    getImageIds(block.backgroundImage)
    getImageIds(block.pages)
    getImageIds(block.people)
    getImageIds(block.locations)

    if (block.slots) {
      try {
        Object.values(block.slots).forEach(slot => {
          if (slot.items) {
            Object.values(slot.items).forEach(item => {
              if (item.imageId) {
                idsToAdd.push(item.imageId)
              }
            })
          }
        })
      } catch (e) {
        console.error(e)
      }
    }

    return Array.from(new Set(idList.concat(idsToAdd)))
  }, [])
}

export default extractPageImageIds