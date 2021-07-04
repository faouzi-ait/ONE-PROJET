import update, { extend } from 'immutability-helper'

extend('$auto', function(value, object) {
  return object ?
    update(object, value):
    update({}, value);
});

extend('$autoArray', function(value, object) {
  return object ?
    update(object, value):
    update([], value);
});

export const resourceWithIdKey = (resource, id) => {
  const obj = {}
  if (id) {
    obj[id] = resource
  } else {
    obj[resource.id] = resource
  }
  return obj
}

export const arrayToIdObj = (resources) => {
  const orderArr = [];
  const objsById = resources.reduce((acc, resource) => {
    acc[resource.id] = resource
    orderArr.push(resource.id)
    return acc
  }, {})
  return {
    orderArr,
    objsById
  }
}

export default update