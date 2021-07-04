import useSWR from "swr"
import { BrightcoveAccountType, WistiaAccountType, KnoxAccountType } from "javascript/types/ModelTypes"
import { findAllByModel } from "javascript/utils/apiMethods"

export const useGetBrightcove = () => {
  return useSWR<BrightcoveAccountType>(
    `brightcove-accounts`,
    () => {
      return findAllByModel('brightcove-accounts', {
        fields: [
          'brightcove-account-id',
          'brightcove-client-id',
          'brightcove-enabled',
          'brightcove-secret',
          'default-ingest-profile',
          'id',
          'player',
        ],
      }).then(accounts => {
        if (accounts.length > 0) {
          return accounts[0]
        }
        return null
      })
    },
    { suspense: true },
  )
}

export const useGetWistia = () => {
  return useSWR<WistiaAccountType>(
    `wistia-accounts`,
    () => {
      return findAllByModel('wistia-accounts', {
        fields: ['id', 'wistia-password', 'wistia-project'],
      }).then(accounts => {
        if (accounts.length > 0) {
          return accounts[0]
        }
        return null
      })
    },
    { suspense: true },
  )
}

export const useGetKnox = () => {
  return useSWR<KnoxAccountType>(
    `knox-accounts`,
    () => {
      return findAllByModel('knox-accounts', {
        fields: [
          'id',
          'api-key',
          'knox-client-id',
          'knox-client-secret',
          'knox-enabled',
          'password',
          'username',
        ],
      }).then(accounts => {
        if (accounts.length > 0) {
          return accounts[0]
        }
        return null
      })
    },
    { suspense: true },
  )
}