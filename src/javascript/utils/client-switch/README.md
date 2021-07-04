# CLIENT SPECIFIC TOOLING

So taking into account all the different ways we have implemented  `/*Region tags*/`

The following components should help us over come these differences.


1) Extra Markup for a specific set of clients  `<ClientSpecific>`

2) Conditionally rendered markup between different clients `<SwitchOrder>`

3) Differently ordered rendering of components between clients `<SwitchOrder>`

4) Different 'props' for different clients `<ClientProps>`

5) Injecting client specific variables into a component. ( e.g. classNames ) `with-client-variables`

5) Injecting client specific variables from a hook. ( e.g. classNames ) `use-client-variables`

6) JS specific to a client ( Should avoid using this, 'think feature' ) `props.isClient()`


# Usage:

## \<ClientSpecific> ( 'if' stmt )

### @props -   `client` : string (e.g. "drg | amc | banijay" )

`if` the current client exists within the string it will render it's children

```JSX
<FormControl label="First Name" error={errors['first-name']}>
  <input type="text" name="first-name" />
</FormControl>

<FormControl label="Last Name" error={errors['last-name']}>
  <input type="text" name="last-name" />
</FormControl>

<ClientSpecific client="amc | keshet" >
  <FormControl label="Email" error={errors['email']}>
    <input type="text" name="email" />
  </FormControl>
</ClientSpecific>
```
### @result - Only amc & keshet will render the email input.

***

## \<ClientChoice> ( 'if/else' stmt )

@props - `none`

@restrictions - `all children must be of type <ClientSpecific>, at least one must have a prop <client="default">`

`if` the current client exists within one of the `<OrderSection>` blocks it will render the first one found,
`else` it will render the default `<ClientSpecific>` block

```JSX
<ClientChoice>

  <ClientSpecific client="default" >
    <FormControl label="First Name" error={errors['first-name']}>
      <input type="text" name="first-name" />
    </FormControl>
    <FormControl label="Last Name" error={errors['last-name']}>
      <input type="text" name="last-name" />
    </FormControl>
  </ClientSpecific>

  <ClientSpecific client="amc | keshet" >
    <input type="text" name="first-name" />
    <input type="text" name="last-name" />
  </ClientSpecific>

</ClientChoice>
```

### @result - amc & keshet will render without \<FormControl> all other clients will render with them.

***

## \<OrderSection>

@props - `clientSpecificOrder`:  Object - defining client specific orders

@restrictions - `all children must be of type <OrderSection>, OrderSection components must have a prop <name: string>`

```JSX
<SwitchOrder
  clientSpecificOrder={{
    'amc | drg': ['first-name', 'email', 'last-name']
    'keshet': ['email', 'last-name']
  }}
>

  <OrderSection name="first-name" >
    <FormControl label="First Name" error={errors['first-name']}>
      <input type="text" name="first-name" />
    </FormControl>
  </OrderSection>

  <OrderSection name="last-name" >
    <FormControl label="Last Name" error={errors['last-name']}>
      <input type="text" name="last-name" />
    </FormControl>
  </OrderSection>

  <OrderSection name="email" >
    <FormControl label="Email" error={errors['email']}>
      <input type="text" name="email" />
    </FormControl>
  </OrderSection>

</SwitchOrder>
```

### @result
  - amc & drg will render in order - firstname, email, lastname
  - keshet will render in order - email, lastname (will only render 2 items)
  - all other clients will render default order - firstname, lastname, email

***

## \<ClientChildWrapper> ( 'if' stmt )

@props - `client`: string (e.g. "drg | amc | banijay" )
         `outerWrapper`: function - renderProp with children as its injected value.

`if` the current client exists within the `client` prop value it will wrap all child components in the renderProp
provided as outerWrapper. For all clients not listed it will render children with no alterations

```JSX
<ClientChildWrapper client="keshet"
  outerWrapper={(children) => (
    <div className='wrapper-class'>{children}</div>
  )}
>
  <div className="hello-world">
    Hello World
  </div>
</ClientChildWrapper>
```

### @result - keshet will render the `hello-world` div nested within a `wrapper-class` div. All other clients will only render the `hello-world` div

***

## \<ClientProps>

@props
  - `clientProps` Object - defining client specific props
  - `renderProp` Fn - to render all children with injected props

## Before

```JSX
return (
  <Banner
    title={resource.title}
    restricted={user && resource.restricted && isInternal(user)}
    breakpoints={breakpoints}
    /* #region  ae | all3 | banijaygroup | cineflix | demo ... => all client apart from ( drg | keshet) */
    copy={resource.introduction}
    /* #endregion */
    /* #region drg | keshet */
    copy={resource.description}
    /* #endregion */
    /* #region drg */
    genre={resource.genres}
    /* #endregion */
  >
    <PdfDownloadButton
      displayPdf={true}
      pdfType="programmes"
      pdfTitle={resource.title}
      postData={{
        id: resource.id || -1,
        Localisation: theme.localisation,
        programmeFeatures: {
          ...theme.features.programmeOverview,
          talent: theme.features.talents
        }
      }}
    />
  </Banner>
)
```

## After

```JSX
return (
  <ClientProps
    clientProps={{
      'copy': {
        'default': resource.introduction,
        'drg | keshet': resource.description
      },
      'genres': {
        'drg': resource.genres
      }
    }}
    renderProp={(clientProps) => (
      <Banner
        title={resource.title}
        restricted={user && resource.restricted && isInternal(user)}
        breakpoints={breakpoints}
/***** Note: Spreading clientProps into child component  ****/
        {...clientProps}
      >
        <PdfDownloadButton
          displayPdf={true}
          pdfType="programmes"
          pdfTitle={resource.title}
          postData={{
            id: resource.id || -1,
            Localisation: theme.localisation,
            programmeFeatures: {
              ...theme.features.programmeOverview,
              talent: theme.features.talents
            }
          }}
        />
      </Banner>
    )}
  >
)
```
copy:
  all clients would recieve a copy prop. `default` would be applied to all clients that are not listed (resource.introduction).
  i.e. all except for drg & keshet in this case. They would recieve their specified prop value (resource.description)
genres:
  drg would be assigned a genres prop all other clients would not as there is no default option named.


***

## with-client-variables (also has a withDefaultClientVariables - which only returns default setting for each variable)

This allows for injecting client specific variables as props into any component.

### Naming Spacing

The first argument is to help stop overwriting client variables, using mulitple `withClientVariables` calls on a component.
This nameSpace argument will be used as the prop to inject all the clientVariables under. So in below example (using `contactForm`) all of the clientVariables
are now stored within the components props under a key of contactForm. e.g. props.contactForm[client-variable]

```JSX
const ContactForm = (props) => (
  <div className="contact">
    <h2>{ props.contactForm.headingTitle } { props.contactForm.headingHours }</h2>
    <div>
      {props.image && (
        <img className="contact__image" src={props.image.file.url} />
      )}
    </div>
  </div>
)

const enhance = compose(
  withClientVariables('contactForm', {
    'headingHours': {
      'default': '( 24 Hours )',
      'cineflix': '( Between 8am - 5pm )'
    }
    'headingTitle': {
      'default': 'Contact Us',
      'drg': 'Contact DRG'
      'amc': 'Contact AMC',
      'cineflix': 'Contact Cineflix',
    },
  })
)

export default enhance(ContactFrom)
```
### @result - clientVariables will return the client specific version if found else it will return the default version.
  - amc: Contact AMC ( 24 Hours )
  - cineflix: Contact Cineflix ( Between 8am - 5pm )
  - drg : Contact Drg ( 24 Hours )
  - all other clients: Contact Us ( 24 Hours )


## Recommendation:
In order to keep Component.tsx/jsx files as compact as possible.

Create a contact-form.variables.tsx at same location to contact-form.tsx. This file can export the JS Object for all client specific code.

This would allow the usage to alter to:

```JSX
import contactFormVariables from './contact-form.variables'

const ContactForm = ({image, contactForm}) => (
  <div className="contact">
    ....
  </div>
)

const enhance = compose(
  withClientVariables('contactForm', contactFormVariables, { /* ... second parameter (calculatedValues) */ })
)

export default enhance(ContactFrom)
```

As it is likely some client variables will want to be calculated, you can inject these directly from the component using the second parameter.

Within withClientVariables it deepmerges the two supplied objects and treats them as one.


***

## use-client-variables (also has a useDefaultClientVariables)

This works the same way as `with-client-variables` just implemented as a hook.

Demonstrated here using the imported client specific code from a .variables file. (As above)

Also shows how calculatedVariables are merged into static imported ones.

```JSX
import contactFormVariables from './contact-form.variables'

const ContactForm = ({image}) => {

  const videos = useSortedVideos()

  const clientVariables = useClientVariables(contactFormVariables, {
    'promoVideo' : {
      'default': videos.getPromoVideo()
    }
  })

  return (
    <div className="contact">
      <h2>{ clientVariables.headingTitle } { clientVariables.headingHours }</h2>
      <div>
        {image && (
          <img className="contact__image" src={image.file.url} />
        )}
      </div>
    </div>
  )
}

export default enhance(ContactFrom)
```
Assuming contactFormVariables imported from above.. cineflix would have clientVariables including all the static imports as well as the calulated values.

  headingTitle: 'Contact Cineflix',
  headingHours: '( Between 8am - 5pm )'
  promoVideo: /* which ever video was returned from videos.getPromoVideo() */


***

## props.isClient()

Lastly I have added a prop to all top level components that are rendered from createRoutes within authComponent.

This is just a js function that returns a boolean if the client name exists within the provided arguments.

I have only done this to try and prevent having to import this function from all over. ( `Ideally` we would `NOT` use this function )

If you are feeling you need to use this, please exhaust all other options. Most pure JS problems should be solved with a feature or another solution.

`props.isClient('amc | drg')` - amc & drg = true, any other client = false
