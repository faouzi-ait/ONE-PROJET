const path = require('path')

const clients = [
  'ae',
  'all3',
  'amc',
  'banijay',
  'cineflix',
  'demo',
  'drg',
  'itv',
  'keshet',
  'rtv',
  'sky',
  'storylab',
]

module.exports = plop => {
  plop.setGenerator('feature', {
    description: 'Add a new feature to each config file',
    prompts: [
      {
        type: 'input',
        name: 'key',
        message: 'The key of the feature to be added:',
      },
      {
        type: 'list',
        name: 'value',
        message: 'The default value of the feature to be added:',
        choices: ['true', 'false'],
      },
    ],
    actions: clients.map(client => ({
      type: 'append',
      path: path.resolve(
        __dirname,
        '../../src/theme',
        client,
        'config/features.js',
      ),
      pattern: /export const Features = {/,
      template: `  {{ camelCase key }}: {{ value }},`,
    })),
  })
}
