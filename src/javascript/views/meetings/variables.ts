export default {
  showBanner: {
    default: false,
    'ae': true
  },
  showBreadcrumb: {
    default: false,
    'ae': true
  },
  fixedCalendar: {
    default: true,
    'ae': false
  },
  todayButtonClasses: {
    default: 'button button--filled',
    'ae': 'button',
    'banijaygroup | drg': 'button button--filled button--small'
  },
  rangeButtonClasses: {
    default: 'button button--icon button--filled',
    'ae': 'button button--icon button--secondary'
  },
  searchButtonClasses: {
    default: 'button button--with-icon',
    'ae': 'button button--with-icon button--secondary',
    'banijaygroup': 'button button--small button--with-icon',
    'drg': 'button button--filled button--with-icon',
    'itv': 'button button--underline button--with-icon'
  },
  clearButtonClasses: {
    default: 'button',
    'ae': 'button button--with-icon button--secondary',
    'banijaygroup': 'button button--small',
    'fremantle': 'button button--ghost',
    'itv': 'button button--underline',
    'drg': 'button button--filled button--small',
  },
  bannerClasses: {
    default: ['intro'],
    ae: ['short']
  },
  modalClasses: { // this is shared across registered-attendees, new-attendees, search
    default: 'modal__wrapper',
    'amc': 'modal__wrapper modal__wrapper--wide'
  },
  addAttendeesButtonClasses: { // this is shared across registered-attendees, new-attendees
    default: 'button button--filled button--small',
    'fremantle': 'button button--filled',
  }
}