import React from 'react'
export const ReportSection = (props) => {
  const classes = ['section', props.bg && props.bg].filter(x => x).join(' section--')
  return (
    <section className={classes}>
        <div className="container report">
        {props.children}
        </div>
    </section>
  )
}

export default ReportSection

