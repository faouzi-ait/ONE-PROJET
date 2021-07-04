import React, { useEffect, useState } from 'react'
import SortableTree from 'react-sortable-tree'
import FullNodeTheme from 'react-sortable-tree-theme-full-node-drag'

import 'stylesheets/admin/components/react-sortable-tree'

import { findAllByModel, updateOneByModel } from 'javascript/utils/apiMethods'
import useSystemPages from 'javascript/utils/hooks/use-system-pages'

interface Props {
  maxDepth?: number
  navigationType: string
  allowChildren?: string[]
}

const MainNavigationOrdering: React.FC<Props> = ({
  maxDepth = 1,
  navigationType,
  allowChildren
}) => {

  const [menuItems, setMenuItems] = useState([])
  const [fetchedMenuItems, setFetchedMenuItems] = useState([])
  const { systemPages } = useSystemPages()
  const restrictChildDragging = maxDepth === 2

  const makeMenuItem = (contentPosition, expanded = true) => {
    const hasPublishedAttr = contentPosition['content-positionable'].hasOwnProperty('published')
    return {
      id: contentPosition.id,
      title: contentPosition['content-positionable']['title'] || contentPosition['content-positionable']['name'],
      published: hasPublishedAttr ? contentPosition['content-positionable']['published'] : true,
      position: contentPosition.position,
      parentId: contentPosition['parent-id'],
      expanded,
      children: []
    }
  }

  const walkMap = (treeData, callback, index = 0) => {
    let mappedData = []
    treeData.forEach((item) => {
      mappedData.push(callback(item, index))
      index += 1
      if (item.children.length) {
        const childItems = walkMap(item.children, callback, index)
        mappedData[mappedData.length -1].children = childItems
        index += childItems.length
      }
    })
    return mappedData
  }

  const walkFindIndex = (treeData, callback) => {
    let indices = []
    for (let index = 0; index < treeData.length; index += 1) {
      if (callback(treeData[index])) {
        indices = [ index ]
        break
      }
      if (treeData[index].children.length) {
        const foundInChildren = walkFindIndex(treeData[index].children, callback)
        if (foundInChildren.length) {
          indices = [index, ...foundInChildren]
          break
        }
      }
    }
    return indices
  }

  const fetchMenu = () => {
    findAllByModel('content-positions', {
      include: ['content-positionable'],
      fields: ['position', 'content-positionable', 'parent-id'],
      includeFields: {
        'pages': ['title', 'slug', 'published'],
        'collections': ['title', 'slug', 'published'],
      },
      filter: {
       'navigation-type': navigationType
      }
    }).then((response) => {
      const parentIndices = {}
      const subMenuItems = []
      let topLevelIndex = 0
      const updateMenuItems = response.reduce((acc, item) => {
        if (!item['content-positionable']) return acc
        const pageStatus = systemPages.includesSlugAndEnabledFeature(item['content-positionable'].slug)
        if (pageStatus.systemPage && !pageStatus.enabled) return acc
        if (item['parent-id']) {
          subMenuItems.push(item)
        } else {
          parentIndices[item.id] = topLevelIndex++
          const expanded = menuItems.find((menuItem) => menuItem.id === item.id)?.expanded
          acc.push(makeMenuItem(item, expanded))
        }
        return acc
      }, [])

      subMenuItems.forEach((subMenuItem) => {
        if (parentIndices.hasOwnProperty(subMenuItem['parent-id'])) {
          updateMenuItems[parentIndices[subMenuItem['parent-id']]].children.push(makeMenuItem(subMenuItem))
        }
      })
      const mappedMenu = walkMap(updateMenuItems, (item, index) => ({
        ...item,
        treeIndex: index
      }))
      setMenuItems(mappedMenu)
      setFetchedMenuItems(mappedMenu)
    })
  }

  useEffect(() => {
    fetchMenu()
  }, [systemPages])

  const onMoveNode = (result) => {
    const movedNode = result.node
    const update = {
      id: result.node.id
    }
    const [topLevelIndex, subLevelIndex] = walkFindIndex(result.treeData, (item) => {
      return item.id === movedNode.id
    })
    const [prevTopLevelIndex, prevSubLevelIndex] = walkFindIndex(fetchedMenuItems, (item) => {
      return item.id === movedNode.id
    })
    if (movedNode.treeIndex === result.treeIndex) {
      if (prevTopLevelIndex === topLevelIndex && prevSubLevelIndex === subLevelIndex) {
        return // menu item dropped where it started from
      }
    }
    if (subLevelIndex === undefined) { // Dropped at top level
      update['parent-id'] = null
      if (topLevelIndex === 0) {
        update['position'] = 1
      } else if (movedNode.treeIndex > result.treeIndex) { // moved upwards
        update['position'] = result.treeData[topLevelIndex - 1]['position'] + 1
      } else { // moved downwards
        if (prevSubLevelIndex !== undefined) {
          update['position'] = result.treeData[topLevelIndex - 1]['position'] + 1
        } else {
          update['position'] = result.treeData[topLevelIndex - 1]['position']
        }
      }
    } else { // Dropped on Sub Menu
      const topLevelNode = result.treeData[topLevelIndex]
      update['parent-id'] = topLevelNode.id
      if (topLevelNode.children.length === 1 || subLevelIndex === 0) {
        update['position'] = 1
      } else {
        if (movedNode.treeIndex > result.treeIndex) { // moved upwards
          if (topLevelNode.children.length <= subLevelIndex + 1) {
            // joined last row of different sub menu
            update['position'] = topLevelNode.children[subLevelIndex - 1]['position'] + 1
          } else {
            update['position'] = topLevelNode.children[subLevelIndex + 1]['position']
          }
        } else { // moved downwards
          if (movedNode.parentId !== parseInt(topLevelNode.id)) {
            // moved between sub-menus, need to account for gaps in positions
            update['position'] = topLevelNode.children[subLevelIndex - 1]['position'] + 1
          } else {
            update['position'] = topLevelNode.children[subLevelIndex - 1]['position']
          }
        }
      }
    }
    updateOneByModel('content-position', update).then((response) => {
      fetchMenu()
    })
  }

  return (
    <div style={{ height: `80vh`, padding: '0px calc(50% - 170px)' }}>
      <SortableTree
        treeData={menuItems}
        onChange={treeData => setMenuItems(treeData)}
        maxDepth={maxDepth}
        theme={FullNodeTheme}
        onMoveNode={onMoveNode}
        /*
        We stopped users from being able to drag children in/out from collection/menu parents. In part to ensure menu nesting reflects FE urls more closely.
        Save having menu items sitting at top level that re-direct to sub-routes, e.g. /news/my-big-article, or vica versa being able to have /news (collection) sitting
        underneath /news/my-big-article (page) in the menu.
        Having forced this structure also allowed my-account to remain a pageResource as we are now able to build FE urls using the /menu.slug/sub-menu.slug
        instead of relying on the page having a collection parent to build the url from. (i.e. /collection.slug/page.slug).
        */
        canDrop={(node) => {
          if(node.nextParent?.id === node.prevParent?.id || !restrictChildDragging) return true
        }}
        canNodeHaveChildren={(node) => {
          if(!allowChildren || allowChildren.includes(node.title)) return true
        }}
        generateNodeProps={({ node, path }) => ({
          title: (
              <div className="rstcustom__node-content">
                {node.title}
                {!node.published && <span className="count count--disabled">Unpublished</span>}
              </div>
          ),
      })}
      />
    </div>
  )
}

export default MainNavigationOrdering