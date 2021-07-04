import { ApiParams } from '../apiMethods'
import {
  ProgrammeType,
  ProgrammeSearchResultType,
} from 'javascript/types/ModelTypes'

const programmeSearchResultQuery: ApiParams<'programme-search-results'> = {
  fields: ['title', 'programme'],
  include: ['programme'],
  includeFields: {
    programmes: ['title-with-genre'],
  },
  page: {
    size: 10,
  }
}

export default programmeSearchResultQuery

export type ProgrammeSearchResultQueryReturn = Pick<
  ProgrammeSearchResultType,
  'title' | 'id'
> & {
  programme: Pick<ProgrammeType, 'title-with-genre'>
}
