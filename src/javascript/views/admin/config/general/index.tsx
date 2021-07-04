import React, { useEffect, useState } from 'react'
import Meta from 'react-document-meta'
import kebabCase from 'lodash/kebabCase'
import { isAdmin, hasPermission } from 'javascript/services/user-permissions'
// Components
import { ConfigSaveButton } from 'javascript/components/tabbed-config-form'
import FormControl from 'javascript/components/form-control'
import PageHeader from 'javascript/components/admin/layout/page-header'
// Types
import VideoProviders from 'javascript/types/VideoProviders'
// HOC
import compose from 'javascript/utils/compose'
import useThemeForm from 'javascript/utils/hooks/use-theme-form'

import withHooks from 'javascript/utils/hoc/with-hooks'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useConfiguration from 'javascript/utils/hooks/use-configuration'
import FileUploader from 'javascript/components/file-uploader'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import { isLiteClient } from 'javascript/utils/theme/liteClientName'

interface Values {
  footerCopy: string | boolean
  clientName: string
  googleAnalyticsId: string | boolean
  googleTagManagerId: string | boolean
  providers: VideoProviders
  customerLogo: string
  customerFavicon: string
  customerProgrammeThumbnailPlaceholder: string
  customerProgrammeBannerPlaceholder: string | {
    xlarge: string,
    large: string,
    medium: string,
    small: string
  }
  defaultRegistrationRecipient: string,
  scheduledDataImport: boolean
}

const ConfigGeneralForm = props => {
  const [errors, setErrors] = useState(null)
  const {
    haveChangesBeenMade,
    makeCheckboxOnChange,
    makeInputProps,
    onSubmit,
    submitStatus,
    makeOnChange,
    values,
  } = useThemeForm<Values>({
    inputs: {
      footerCopy: {
        selector: theme => theme.features.footerCopy,
        reverseSelector: footerCopy => ({
          features: {
            footerCopy,
          },
        }),
      },
      defaultRegistrationRecipient: {
        selector: theme => theme.features.emails.pendingApprovals.noAccountManagerRecipient.join(', '),
        reverseSelector: noAccountManagerRecipient => ({
          features: {
            emails: {
              pendingApprovals: {
                noAccountManagerRecipient: noAccountManagerRecipient
                  .split(',')
                  .filter(Boolean)
                  .map(s => s.trim()),
              },
            },
          },
        }),
      },
      clientName: {
        selector: theme => theme.localisation.client,
        reverseSelector: client => ({
          localisation: {
            client,
          },
        }),
      },
      googleAnalyticsId: {
        selector: theme => theme.features.google.analyticsId,
        reverseSelector: analyticsId => ({
          features: {
            google: {
              analyticsId,
            },
          },
        }),
        shouldLiveUpdate: false,
      },
      googleTagManagerId: {
        selector: theme => theme.features.google.tagManagerId,
        reverseSelector: tagManagerId => ({
          features: {
            google: {
              tagManagerId,
            },
          },
        }),
        shouldLiveUpdate: false,
      },
      providers: {
        selector: theme => theme.features.providers,
        reverseSelector: providers => ({
          features: {
            providers,
          },
        }),
      },
      customerLogo: {
        selector: theme => theme.customer.logoImageUrls?.default,
        reverseSelector: logo => ({
          customer: {
            logoImageUrls: {
              default: logo
            }
          },
        }),
      },
      customerFavicon: {
        selector: (theme) => typeof theme.customer.faviconUrls?.default === 'string'
          ? theme.customer.faviconUrls?.default
          : theme.customer.faviconUrls?.default?.retina,
        reverseSelector: logo => ({
          customer: {
            faviconUrls: {
              default: logo
            }
          },
        }),
      },
      customerProgrammeThumbnailPlaceholder: {
        selector: theme => theme.customer.programmeThumbnailPlaceholderImageUrls?.default,
        reverseSelector: placeholder => ({
          customer: {
            programmeThumbnailPlaceholderImageUrls: {
              default: placeholder
            }
          },
        }),
      },
      customerProgrammeBannerPlaceholder: {
        selector: theme => theme.customer.programmeBannerPlaceholderImageUrls?.default,
        reverseSelector: placeholder => ({
          customer: {
            programmeBannerPlaceholderImageUrls: {
              default: placeholder
            }
          },
        }),
      },
      scheduledDataImport: {
        selector: theme => theme.features.dataImport.scheduled?.enabled,
        reverseSelector: enabled => ({
          features: {
            dataImport: {
              scheduled: {
                enabled
              }
            },
          },
        }),
        shouldLiveUpdate: false,
      },
    },
    handleSubmit: (values) =>
      new Promise<any>((resolve, reject) => {
        Promise.all(
          Object.keys(values).map((configType: keyof CustomThemeType) => {
            if(configType === 'customer'){
              if(values['customer']['programmeBannerPlaceholderImageUrls']){
                values['customer']['programmeBannerPlaceholderImageUrls']['responsive'] = true
              }
              return props.saveImages(values['customer'])
            }
            return useConfiguration(configType).save(values)
          }),
        ).then(responses => {
          resolve(responses[0])
          setErrors(null)
        }).catch(reject => {
          const errors = reject.data ? reject.data.errors : Object.keys(reject).map(e => {
            return {
              detail: `${e}: ${reject[e]}`
            }
          })
          setErrors(errors)
          resolve(null)
        })
      }),
  })

  const renderErrors = () => {
    if (errors) {
      return (
        <ul className="cms-form__errors">
          {errors.map((error, i) => {
            return <li key={i}>{error.detail}</li>
          })}
        </ul>
      )
    }
  }

  return (
    <Meta>
      <main>
        <PageHeader title="General options" />
        <div className="container">
          <form className="cms-form cms-form--large" onSubmit={onSubmit}>
            <FormControl
              required
              type="text"
              label="Client Name"
              name="client"
              {...makeInputProps('clientName')}
            />
            <FormControl
              type="text"
              label="Google Analytics ID"
              name="googleAnalyticsId"
              {...makeInputProps('googleAnalyticsId')}
            />
            <FormControl
              type="text"
              label="Google Tag Manager ID"
              name="googleTagManagerId"
              {...makeInputProps('googleTagManagerId')}
            />
            <FormControl
              type="text"
              label="Copyright Text"
              name="footerCopy"
              description={
                'To include the current calendar year insert {{fullYear}} in the text.'
              }
              {...makeInputProps('footerCopy')}
            />
            <FormControl
              type="text"
              label="Default Registration Email"
              name="defaultRegistrationRecipient"
              description={
                `When new users don't choose a ${props.theme.localisation.accountManager.lower} as they register, this email address will be notified.`
              }
              {...makeInputProps('defaultRegistrationRecipient')}
            />
            {props.theme.features.dataImport.scheduled?.edit &&
            (isAdmin(props.user) || hasPermission(props.user, 'manage_data_import')) &&
              <FormControl
                type="checkbox"
                label={`Scheduled Data Import`}
                id="scheduledDataImport"
                name="scheduledDataImport"
                checkboxLabeless={true}
                onChange={makeCheckboxOnChange('scheduledDataImport')}
                checked={values.scheduledDataImport}
              />
            }
            {isLiteClient() &&
              <>
                <FileUploader
                  title="Logo (400 x 120)"
                  fileSrc={values.customerLogo}
                  onChange={(_, dataUrl) => {
                    if (typeof dataUrl === 'string') {
                      makeOnChange('customerLogo')(dataUrl)
                    }
                  }}
                  name="logo"
                  fileType="Logo"
                  deleteAllowed={false}
                />

                <FileUploader
                  title="Favicon (16 x 16)"
                  fileSrc={values.customerFavicon}
                  onChange={(_, dataUrl) => {
                    if (typeof dataUrl === 'string') {
                      makeOnChange('customerFavicon')(dataUrl)
                    }
                  }}
                  acceptedFileTypes={['image/png']}
                  name="favicon"
                  fileType="Favicon"
                  deleteAllowed={false}
                />
                <FileUploader
                  title="Programme Card Placeholder Image (560 x 350)"
                  fileSrc={values.customerProgrammeThumbnailPlaceholder}
                  onChange={(_, dataUrl) => {
                    if (typeof dataUrl === 'string') {
                      makeOnChange('customerProgrammeThumbnailPlaceholder')(dataUrl)
                    }
                  }}
                  name="placeholder"
                  fileType="Image"
                  deleteAllowed={false}
                />
                <FileUploader
                  title="Programme Banner Placeholder Image (1600 x 600)"
                  fileSrc={typeof values.customerProgrammeBannerPlaceholder === 'string'
                  ? values.customerProgrammeBannerPlaceholder
                  : (values.customerProgrammeBannerPlaceholder?.medium || '')}
                  onChange={(_, dataUrl) => {
                    if (typeof dataUrl === 'string') {
                      makeOnChange('customerProgrammeBannerPlaceholder')(dataUrl)
                    }
                  }}
                  name="placeholder"
                  fileType="Image"
                  deleteAllowed={false}
                />
              </>
            }
            <div className="cms-form__control cms-form__control--actions">
              {renderErrors()}
              <ConfigSaveButton
                haveChangesBeenMade={haveChangesBeenMade}
                submitStatus={submitStatus}
                buttonText="Save Config"
              />
            </div>
          </form>
        </div>
      </main>
    </Meta>
  )
}

const enhance = compose(
  withHooks((props) => {

    const relation = {
      name: 'customer',
      id: props.theme.customer.id
    }
    const [imageUploading, setImageUploading] = useState(null)
    const [imageIds, setImageIds] = useState({})
    const [responsiveImageIds, setResponsiveImageIds] = useState({})
    const imageResource = useReduxResource('image', 'customer/images', relation)
    const responsiveImageResource = useReduxResource('responsive-image', 'customer/responsive-images', relation)

    const getCustomerImages = () => {
      imageResource.findAllFromOneRelation(relation, {
        fields: {
          'images': 'name'
        },
        filter: {
          'variant': 'default'
        }
      }).then((response) => {
        setImageIds(response)
        setImageUploading(null)
      })
    }

    const getCustomerResponsiveImages = () => {
      responsiveImageResource.findAllFromOneRelation(relation, {
        fields: {
          'responsive-images': 'name'
        },
        filter: {
          'variant': 'default'
        }
      }).then((response) => {
        setResponsiveImageIds(response)
        setImageUploading(null)
      })
    }

    const saveImages = (images) => new Promise((resolve, reject) => {
      Object.keys(images).forEach((type) => {
        const imageIsResponsive = images[type].responsive
        const name = kebabCase(`customer-${type.replace('ImageUrls', '').replace('Urls', '')}`)
        const imageArray = imageIsResponsive ? responsiveImageIds : imageIds
        const currentImage = Object.keys(imageArray).filter((i) => { return imageArray[i].name === name }).reduce((obj, key) => {
          obj[0] = imageArray[key]
          return obj
        }, {})[0]

        //Create Resources for saving
        const saveResource = {
          id: null,
          name,
          variant: 'default'
        }
        if (currentImage) {
          saveResource.id = currentImage.id
        }
        let uri = imageIsResponsive ? 'xlarge' : 'image'

        saveResource[`${uri}-data-uri`] = images[type].default
        saveResource['customer'] = relation

        let save = currentImage ? imageResource.updateResource : imageResource.createResource
        if(imageIsResponsive) {
          saveResource['default-image'] = 'xlarge'
          saveResource['small-data-uri'] = ''
          saveResource['medium-data-uri'] = ''
          saveResource['large-data-uri'] = ''
          save = currentImage ? responsiveImageResource.updateResource : responsiveImageResource.createResource
        }
        setImageUploading('loading')
        save(saveResource)
        .then(() => {
          resolve(images)
          imageIsResponsive ? getCustomerResponsiveImages() : getCustomerImages()
        })
        .catch((error) => {
          reject(error)
        })
      })

    })

    useEffect(() => {
      getCustomerImages()
      getCustomerResponsiveImages()
    }, [])

    return {
      ...props,
      imageUploading,
      saveImages
    }

  })
)

export default enhance(ConfigGeneralForm)