# Client Configuration

In 2019 we consolidated our frontend repositories into one and as an interim solution we introduced region tags. These handle differentiations of Javascript between clients. Details of how these work can be found on the custom plugin that we built to implement these https://github.com/thisisonetv/foldclient

We now want to look to remove these over time for scalability of the platform. Where region tags are used the most appropriate method from the list below should be used instead. 

## 1) Features 
Features are set in the api and retrieved and saved on load of the site. We no longer keep these in our front-end repo. These should be used when:
- A feature may be 'turned on' or have unique settings per client
- A feature needs to be shared with the app

These can be accessed via the theme e.g `theme.features.groups.enabled`. A full list of existing features will be generated when running the site in `/src/javascript/config/default-api-features.ts`

## 2) Client switch
Client switch houses a few different tools to help with client specific markup. These should be used for:
- Extra Markup for a specific set of clients
- Client specific ordering of components
- Differing class names per client
- Client differences relevant to that view/component only

For instructions on proper use and file structure see https://github.com/rawnet/one-web/tree/master/src/javascript/utils/client-switch

## 3) Icons
Icons often differ per client in the svg path that is rendered and the size. All svg paths are set in `/src/javascript/config/svg-icons.js`. Any client specific overrides are then handled in the client custom icons file e.g `/src/theme/itv/config/custom-icons.ts`. Width, Height and ViewBox are then set for each icon in `/src/javascript/components/icon/variables.ts`

## 4) Variables
Default variables are defined in the `customConfig` object in `/src/javascript/config/features.ts`. Any client specific overrides are then handled in the clients custom features file e.g `/src/theme/itv/config/custom-features.ts`. These should be used when:
- A client requires unique settings that are used by multiple views/components but does not need to be put in the api

Variables should be used sparingly and methods 1 & 2 are preferred