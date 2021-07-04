import pluralize from 'pluralize'

export default {
  filterSeparator: {
    default: (item) => item.split(':'),
    'demo | discovery | endeavor | fremantle | drg | keshet': (item) => {
      const firstColon = item.indexOf(':');
      return [item.slice(0, firstColon), item.slice(firstColon + 1)]
    }
  },
  booleanLabelTrue: {
    default: (theme, t) => `Show ${pluralize(theme.localisation.programme.upper)} that are "${pluralize(t.name)}"`,
    'cineflix': (theme, t) => 'True'
  },
  booleanLabelFalse: {
    default: (theme, t) => `Show ${pluralize(theme.localisation.programme.upper)} that aren't "${pluralize(t.name)}"`,
    'cineflix': (theme, t) => 'False'
  },
}