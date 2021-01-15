const fetch = require('node-fetch')
const { i18next } = require('./i18next.js')
const config = require(process.cwd() + '/config.json', 'must-exclude')

let url = ''
let version = ''
let isOnline = true

const ENDPOINTS = {
  status: '/status',
  cosmetic_search: '/cosmetics/search'
}

class Server {
  constructor (options) {
    if (!options.url) {
      return {
        error: true,
        msg: 'baseurl_missing'
      }
    }
    url = options.url
    if (url.split('')[url.split('').length - 1] === '/') {
      url = url.split('').slice(0, url.split('').length - 1).join('')
    };
    version = options.version || null
    if (version) {
      url = url + '/api/' + version + ''
    } else {
      url = url + '/api'
    };
    return Server
  };

  static checkStatus () {
    return new Promise(function (resolve, reject) {
      fetch(url + ENDPOINTS.status).then(res => res.json()).catch(err => {
        if (err) {
          if (isOnline) {
            isOnline = false
            console.log(`[${i18next.t('warning', { ns: 'console', lng: config.preferred_language })}] ${i18next.t('server_status.offline', { ns: 'console', lng: config.preferred_language })}`)
          };
          return { server_off: true }
        };
      }).then(res => {
        if (!res.server_off && !isOnline) {
          isOnline = true
          console.log(`[${i18next.t('information', { ns: 'console', lng: config.preferred_language })}] ${i18next.t('server_status.online', { ns: 'console', lng: config.preferred_language })}`)
        };
        return resolve(res)
      })
    })
  };

  static searchCosmetic (query, type) {
    if (!isOnline) {
      return {
        server_off: true
      }
    }
    return new Promise(function (resolve, reject) {
      try {
        fetch(url + ENDPOINTS.cosmetic_search, {
          headers: {
            query,
            type
          }
        }).then(res => res.json()).catch(err => {
          if (err) {
            if (isOnline) {
              isOnline = false
              console.log(`[${i18next.t('warning', { ns: 'console', lng: config.preferred_language })}] ${i18next.t('server_status.offline', { ns: 'console', lng: config.preferred_language })}`)
            };
            return { server_off: true }
          };
        }).then(res => {
          return resolve(res)
        })
      } catch (err) {
        return reject(err)
      }
    })
  };
};

module.exports = Server
