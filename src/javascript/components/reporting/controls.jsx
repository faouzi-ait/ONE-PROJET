import React from 'react'
import DatePicker from 'javascript/components/datepicker'
import CustomSelect from 'javascript/components/custom-select'
import withTheme from 'javascript/utils/theme/withTheme'

export const ReportControls = ({children}) =>
  <div className="chart__controls">
    {children}
  </div>

export const DateInput = withTheme(({value, onChange, children, theme}) =>
  <div>
    <label className="form__label">{children}</label>
    <DatePicker onChange={onChange} selected={value} dateFormat={theme.features.formats.shortDate} />
  </div>
)

export const Limit = ({value, onChange}) =>
  <div>
    <label className="form__label">Limit</label>
    <CustomSelect
      placeholder={ false }
      name="limit"
      value={ value }
      onChange={ onChange }
      options={[{
        value: 5,
        label: 'Top 5'
      },{
        value: 10,
        label: 'Top 10'
      },{
        value: 50,
        label: 'Top 50'
      },{
        value: 100,
        label: 'Top 100'
      }]}/>
  </div>

export const Precision = ({value, onChange }) =>
  <div>
    <label className="form__label">Precision</label>
    <CustomSelect
      placeholder={ false }
      name="precision"
      value={ value }
      onChange={ onChange }
      options={[{
        value: 'daily',
        label: 'Daily'
      },{
        value: 'weekly',
        label: 'Weekly'
      },{
        value: 'monthly',
        label: 'Monthly'
      },{
        value: 'yearly',
        label: 'Yearly'
      }]}/>
  </div>

export const Platform = ({ value, onChange }) =>
  <div>
    <label className="form__label">Platform</label>
    <CustomSelect
      placeholder={false}
      name="source-type"
      value={ value }
      onChange={ onChange }
      options={[{
        value: 'web,app',
        label: 'Both'
      },{
        value: 'web',
        label: 'Website'
      },{
        value: 'app',
        label: 'App'
      }]}/>
  </div>
