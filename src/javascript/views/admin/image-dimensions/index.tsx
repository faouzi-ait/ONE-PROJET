import React from 'react'
import styled from 'styled-components'

import imageDimensions from 'javascript/config/image-dimensions'

import Meta from 'react-document-meta'
import PageHeader from 'javascript/components/admin/layout/page-header'

import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'

interface Props {
  theme: CustomThemeType
}

interface ComponentTypes {
  [key: string]: string
}


const ImageDimensions:  React.FC<Props> = ({
  theme,
}) => {
  const dimensions = imageDimensions.dimensions || []

  const renderDimensionComponents = (components: ComponentTypes) => {
    if (!components) return null
    return Object.keys(components).map((key) => {
      return (
        <ListItem>
          <Name>{key}</Name>
          <Dimension>{components[key]}</Dimension>
        </ListItem>
      )
    })
  }

  const renderDimensions = () => {
    return dimensions.map((imgData, index) => {
      return (
        <Card key={index} >
          <Title>{imgData.name}:</Title>
          {imgData.comment && (
            <Comment>{imgData.comment}</Comment>
          )}
          { imgData.url && (
            <UrlLink href={imgData.url} className="text-button">{imgData.url}</UrlLink>
          )}
          { renderDimensionComponents(imgData.components) }
        </Card>
      )
    })
  }

  return (
    <Meta
      title={`${theme.localisation.client} :: Image Dimensions`}
      meta={{
        description: `View Configuration for Image Dimensions`
      }}
    >
      <main>
        <PageHeader title={`Manage Image Dimensions`} />
        <div className="container">
          <p>When uploading an image, the ONE system will resize and crop your image to the following sizes. In order to achieve the best results you should upload an image with at least the dimensions shown.</p>
          <p>All sizes account for retina displays.</p>
          <div className="grid grid-three">
            { dimensions.length ? renderDimensions() : (
              <div className="panel u-align-center">
                <p>There are currently no Image Dimensions available</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </Meta>
  )
}

const Card = styled.section`
  background: #ffffff;
  width: 30%;
  min-height: 150px;
  box-sizing: border-box;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  padding: 10px 25px 25px;
  margin-bottom: 25px;
`

const Title = styled.h2`
  display: flex
  align-items: center;
  font-size: 18px;
`

const Comment = styled.span`
  font-size: 16px;
  margin: -15px 0 0;
`

const UrlLink = styled.a`
  line-height: 1;
  margin: 5px 0 15px;
  overflow-wrap: break-word;
  padding: 0px 0px 15px !important;
  font-size: 14px !important;
  text-transform: lowercase !important;
`
const ListItem = styled.div`
  font-size: 14px;
`

const Name = styled.span`
  font-weight: bold;
`

const Dimension = styled.span`
  margin-left: 8px;
`



export default ImageDimensions