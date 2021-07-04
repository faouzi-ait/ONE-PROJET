# Pro Clients

Pro Clients require their own theme. The steps for setting up a new pro client are as follows:

### Theming
- Copy an existing client folder within `src/theme` and name it as per your new client. The name will need to be as it appears in the api url. 
- Extend any variables and region tags(we are slowly migrating away from these) to include new client name. Best way to is to do a find and replace on the client name you copied the theme from. e.g replace `| endemol` with `| endeavor | endemol`.
- Once you've tested that the site builds, merge the region tag changes to master
- Then begin making your specific styling changes for the new client based on the designs

### Netlify
- Within netlify, new sites will need to be set up for staging and production. Deploy settings can match existing clients
https://app.netlify.com/sites/cineflix-staging/settings/deploys <br/>
https://app.netlify.com/sites/cineflix-production/settings/deploys

### Circle CI
For staging environments to be built, a new dock erimage will need to be added for the new client name. The Readme is here `/CIRCLE-CI.md` 

### PDFs
- Theming of programme & lists pdfs needs to be handled per client. This sits on a different repo and is deployed via AWS https://github.com/rawnet/one-pdf

### Google Console
- Login to google console here https://www.google.com/u/2/recaptcha/admin (details in 1password) and add a new site v2 with the correct domain
- The site key and secret key will then to be added in the api by backend