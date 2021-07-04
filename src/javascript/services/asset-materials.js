import APIHelper from 'javascript/services/helper'
import AssetItemsService from 'javascript/services/asset-items'
import pluralize from 'pluralize'
import uuid from 'uuid/v4'
import { from, Observable, forkJoin } from 'rxjs'
import { mergeMap, retry } from 'rxjs/operators'
import modelData from 'javascript/models'

class AssetMaterialService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'asset-material'
    this.requestCount = {
      programmes: 0,
      series: 0
    }
    this.jsonApi.define('asset-material', modelData.assetMaterials)
    this.jsonApi.define('programme', modelData.programmes)
    this.jsonApi.define('series', modelData.series)
    this.jsonApi.define('asset-category', modelData.assetCategories)
    this.jsonApi.define('asset-item', modelData.assetItems)
    this.jsonApi.define('user', modelData.users)
    this.jsonApi.define('company', modelData.companies)
    this.jsonApi.define('language', modelData.languages)
  }

  createResource(resource, files) {

    const createWithExternalFileUrl = async (resource) => {
      let assetMaterial
      try {
        assetMaterial = await this.jsonApi.create(this.resourceName, resource)
        await this.jsonApi.create('asset-item', {
          'external-file-url': resource.externalUrl,
          'asset-material':  {
            id: assetMaterial.id
          }
        })
        this.actions.resourceCreated()
      } catch (errors) {
        if (assetMaterial?.id) {
          this.jsonApi.destroy(this.resourceName, assetMaterial.id)
        }
        this.actions.error(errors)
      }
    }

    if (resource.gallery) {
      this.jsonApi.create(this.resourceName, resource).then((response) => {
        const uploader = new AssetItemsService({
          onUpload: () => {
            this.actions.resourceCreated()
          },
          onError: (errors) => {
            this.actions.error(errors)
          },
          onProgress: (percent) => {
            this.actions.fileProgress(percent)
          }
        })
        uploader.uploadAssets(files, response.id)
      }).catch((errors) => {
        this.actions.error(errors)
      })
    } else if (resource.externalUrl?.length) {
      createWithExternalFileUrl(resource)
    } else {
      const progress = {}
      const count = files.length
      const uploads = []
      const concurrentUploads = 5

      from(files)
        .pipe(
          mergeMap((file) => {

            // strip special chars out of filename
            const newFile = new Blob([ file ], { type: file.type });
            newFile.name = file.name.replace(/(?!\.[^.]+$)\.|[^\w.]+/g, '');
            const now = Date.now();
            newFile.lastModifiedDate = new Date(now);
            newFile.lastModified = now
            file = newFile;

            const id = uuid()
            progress[ id ] = 0

            const upload = Observable.create(observer => {
              const { next, error, complete } = observer
              this.jsonApi.create(this.resourceName, resource)
                .then((response) => {
                  let that = this
                  const uploader = new AssetItemsService({
                    onUpload() {
                      next.call(observer)
                      complete.call(observer)
                    },
                    onError(errors) {
                      this.onProgress(0, id)
                      from(that.jsonApi.destroy(that.resourceName, response.id))
                        .pipe(retry(3))
                        .subscribe()
                      error.call(observer)
                      that.actions.error(errors)
                    },
                    onProgress(percent, j) {
                      progress[ j ] = percent
                      const total = Math.floor(Object.values(progress).reduce((a, b) => a + b, 0) / count)
                      that.actions.fileProgress(total)
                    }
                  })
                  uploader.uploadAsset(file, response.id, id)
                })
                .catch(err => {
                  console.warn(err)
                  error()
                })
            });

            return upload
          }, concurrentUploads),
          retry(3)
        ).subscribe(
          upload => {

          },
          err => console.warn(err),
          () => {
            forkJoin(uploads).subscribe(
              () => {
                this.actions.resourceCreated()
              },
              err => console.warn(err),
              () => this.actions.resourceCreated()
            )
          }
        )
    }
  }

  deleteResources(resources) {
    let count = 0
    const resourceCount = resources.length

    resources.map((resource) => {
      this.jsonApi.destroy(this.resourceName, resource).then(() => {
        count++
        if (count === resourceCount) {
          this.actions.resourcesDeleted(resources)
        }
      }).catch((errors) => {
        this.actions.error(errors)
      })
    })
  }

  saveResource = async (resource, externalFileAsset) => {
    try {
      const material = await this.jsonApi.update(this.resourceName, resource)
      if (externalFileAsset) {
        await this.jsonApi.update('asset-item', {
          id: externalFileAsset.id,
          'external-file-url': externalFileAsset['external-file-url']
        })
      }
      this.actions.resourceSaved(material)
    } catch(errors) {
      this.actions.error(errors)
    }
  }

  getResources(query, id) {
    const requestCount = ++this.requestCount[ id ]
    this.jsonApi.findAll(`${pluralize(this.resourceName)}`, query).then((response) => {
      this.actions.receiveResources(response, id, requestCount)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  search(query, callback) {
    this.jsonApi.findAll(`${pluralize(this.resourceName)}`, query).then(callback)
  }

  updateResourcePermissions(resource) {
    this.jsonApi.update(this.resourceName, resource).then((response) => {
      this.actions.resourcePermissionUpdate(response)
    }).catch((error) => {
      this.actions.error(error)
    })
  }
}

const service = new AssetMaterialService
export default service
