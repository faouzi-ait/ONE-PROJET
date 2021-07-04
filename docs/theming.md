# Theming

For core features that could be used on any client we need to set up styles in a specific way.

## Component styling
- Create a new component stylesheet in `stylesheets/core/components`
- Layout can be defined here but for anything specific to client styles e.g colours and fonts should be declared with variables.
- Create a default stylesheet to be used if no theme stylehseet is set in `stylesheets/default/components` with the same name as the core stylesheet. Default theme variables should be set here e.g $base-colour, $base-font-family
- For specific client styling, create a new stylesheet in `theme/<client>/components` with the same name as the core stylesheet.