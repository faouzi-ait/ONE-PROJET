# Migration Plan to One Lite

_This readme is a work in progress. If you have any questions or feel something should be added, bring it up in a FE slack channel._

#### Goals

 - Add customisable styling which can be altered at runtime.

#### Guiding principles

 - Make as few changes to existing files as possible.
 - Make sure we don't bork other clients websites.
 - Use Typescript for maintainability, dev experience, and to ensure code quality.
 - Use Storybook for unit testing and documentation.

## RTV is dead! Long live lite!

The plan is to wind down RTV as a dev platform. This means From now on, `rtv = lite`. If you want to run the lite storybook, run `npm run storybook rtv`. If you want to run the lite client, run `npm start rtv`.

At some point, we'll change over all references to 'rtv' to 'lite', and we'll be away. But for now, consider `rtv` and `lite` as functionally the same from a FE point of view.

## The Theme Object

To make customisable styles, we need to have an object which represents those styles. Here is a google doc we're working with to keep track of it.

https://docs.google.com/spreadsheets/d/1gKSOBBbmj4UCG0cqpeF5TsTy9Btc2N_vWU42Wumq2QU/edit#gid=0

### ThemeType.ts

We also need to know on the FE what shape the ThemeObject should be. Typescript is totally invaluable here, because:

 - It gives us autocomplete wherever we use the theme (no checking of distant files to see if something exists)
 - It gives us type checking on usages of the theme, so we can get errors if we're using it incorrectly or we decide to change the theme's structure.

> **CODE TIP:**
> 
> You'll notice we've divided up ThemeType.ts into lots of very small files. This is for git reasons, so that commits come in with fewer merge conflicts. If you need to add an object with more than 2-3 params into the ThemeType, add it as a new file.

#### How it works

The theme is pulled from the API and passed in to a ThemeProvider. Check out `ThemeProvider.tsx` and its related files for how it works.

#### makeInheritedLiteStyles/index.ts

The theme is going to get deeply nested. For instance, `styles.navigation.links.color`. If, in this case, `links` is undefined, it's going to cause an error.

We need to make sure that every attribute in the theme always initialises with a value. This means we need to keep a default value for each theme value somewhere in the repository.

This gets complicated with inheritance, because some values inherit from other values. For instance, if not defined, the background colour for a primary button defaults to the brand colour.

We don't want to have to check every time we use the button colour if it's defined, so instead we populate it with a default value using the `makeDefaultButtonStyles` function.

> **CODE TIP:**
>
> Similar to the ThemeType.ts advice above, split up your makeDefaultStyles functions into smaller files so that they don't cause merge conflicts with other branches.

## Backwards-compatible Styled Components

We want to be able to change styles at runtime. Styled components, paired with a ThemeProvider, are a great tool for this.

The trouble is, styled-components are inherently component-focused. The one-web repo is not very component-focused, it's built on SASS and classNames. This means that in order to properly migrate to styled-components, we'd need to make many, many changes. For instance, every `<button className="button button--filled" />` would need to be changed to `<Button variant="filled" />`.

### createGlobalStyle

We want to get away with changing as few files as possible. Luckily, styled-components gives us a way of adding runtime styles to classNames: `createGlobalStyle`. Look at `GlobalStyle.tsx`. It creates a global style object, injected at runtime, which can be changed via a ThemeProvider. 

This means that we don't have to change any markup, or even change any of the RTV SASS. Instead, we write overwrites to the SASS using `makeLiteStyles`.

### makeLiteStyles

`makeLiteStyles.ts` is a function which helps you create styles which can be injected into `GlobalStyle.tsx`. You get access to the `styles` portion of the theme object, and you can build dynamic css.

`makeLiteStyles` also helps in another way. If it detects you're not in a `lite` instance (for instance, on `amc`), then it won't inject any styles. This means we know for sure that changes we make for lite don't affect other clients.

> **CODE TIP:**
>
> Where should you put these `makeLiteStyles` functions? It is crucial that you put them in a typescript file - `buttonStyles.tsx` - so that you can get type checking on the theme object. Check out the folder structure section below.

## Storybook

### Documentation

Storybook will be our main source of documentation and unit testing for lite. We'll be able to check that changes we make in the theme filter down correctly, and it provides an excellent development experience.

You can run it with `npm run storybook rtv`.

### Folder structure

We're going to be adding a few new files into our components folder, which gives us a chance to look at folder structure. Our components mostly currently work from one file each: `header.jsx` or `autosuggest.jsx`. We'll need to add a 'styles' file, which builds a `makeLiteStyles`, and a 'stories' file, which plants the component into the storybook.

Let's work by example. Imagine you're refactoring the `header.jsx` file to use lite:

> **CODE TIP:**
> 
> - Make a new folder called `components/header`
> - Move `components/header.jsx` to `components/header/index.jsx`
> - Create a file called `components/header/headerStyles.tsx`
> - Create your `makeLiteStyles` function in there. Don't forget to import it into `GlobalStyle.tsx`
> - Create a file called `components/header/header.stories.tsx`
> - Create your stories there.

This leaves you with three files, each inside a folder. All the previous imports of header still work, and you haven't needed to change any code inside header.jsx itself, so the git history will still apply.