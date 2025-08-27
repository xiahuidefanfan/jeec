import request from '@/utils/request'

export function getAlertsList(params) {
  return request({
    url: '/project/alerts/list',
    method: 'get',
    params
  })
}

export function addAlerts(data) {
  return request({
    url: '/project/alerts/add',
    method: 'post',
    data
  })
}

export function updateAlerts(data) {
  return request({
    url: '/project/alerts/edit',
    method: 'put',
    data
  })
}

export function deleteAlerts(id) {
  return request({
    url: '/project/alerts/delete',
    method: 'delete',
    params: { id }
  })
}

export function exportAlerts(params) {
  return request({
    url: '/project/alerts/exportXls',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

export function importAlerts(data) {
  return request({
    url: '/project/alerts/importExcel',
    method: 'post',
    data
  })
}