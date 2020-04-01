import * as _ from 'lodash'

export const getEndpointError = (axiosErrorObj: any) => {
  return _.get(axiosErrorObj, 'response.data.message', 'Unknown error')
}
