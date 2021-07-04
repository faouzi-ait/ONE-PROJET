import React from 'react'

import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'

// Components
import PdfDownloadButton from 'javascript/components/pdf-download-button'
import Icon from 'javascript/components/icon'

const ButtonExportOptions = ({ exportDownload, className, selectedList, theme }: Props) => {
  return (
    <>
      <PdfDownloadButton
        buttonClasses={className}
        displayPdf={true}
        pdfType="lists"
        pdfTitle={selectedList && selectedList.name || 'List'}
        postData={{
          id: selectedList && selectedList.id || -1,
          styles: theme.styles,
          name: theme.localisation.client
        }}
      />
      <button onClick={() => exportDownload('csv')} className={className}>
        <ClientChoice>
          <ClientSpecific client="default">
            Save as CSV
          </ClientSpecific>
          <ClientSpecific client="ae">
            <Icon id="i-download" classes="button__icon" />
            Download CSV
          </ClientSpecific>
        </ClientChoice>         
      </button>
      <button onClick={() => exportDownload('docx')} className={className}>
        <ClientChoice>
          <ClientSpecific client="default">
            Save as DOCX
          </ClientSpecific>
          <ClientSpecific client="ae">
            <Icon id="i-download" classes="button__icon" />
            Download DOCX
          </ClientSpecific>
        </ClientChoice> 
      </button>
    </>
  )
}

interface Props {
  exportDownload: (exportType: ExportType) => void
  className: string
  selectedList: {
    name?: string,
    id?: number
  }
  theme: any
}

export type ExportType = 'pdf' | 'csv' | 'docx'

export default ButtonExportOptions
