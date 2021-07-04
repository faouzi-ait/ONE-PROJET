
import { ApiLocalisationType } from 'javascript/utils/theme/types/ApiLocalisationType'

export type LocalisationType = ApiLocalisationType & FrontendLocalisationType


/*

For now I am keeping FrontendLocalisationType - This allows me to still have custom localisation per client
once we are fetching localisation for all clients we can remove this and just export the ApiLocalisationType.
Essentially getting all Localisation from the BE. For now it is still using a mixture so we can merge this to master
without effecting any of our enterprise customers

These are values that need entering into BE schema..

*/

export interface FrontendLocalisationType {
  catalogue: {
    path: string
  }
  styles: {
    upper: string
    lower: string
  }
  list: {
    path: string
  }
  meeting: {
    path: string
  }
  productionCompany: {
    path: string
  }

}
