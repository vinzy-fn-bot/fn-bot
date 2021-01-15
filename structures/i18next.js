const i18next = require('i18next')
const Backend = require('i18next-node-fs-backend')
const fs = require('fs')

class I18N {
  constructor () {
    return new Promise((resolve) => {
      i18next.use(Backend).init({
        ns: ['bot', 'console', 'setup', 'errors'],
        defaultNS: 'bot',
        backend: {
          loadPath: './locales/{{lng}}/{{ns}}.json',
          addPath: './locales/{{lng}}/{{ns}}.missing.json',
          jsonIndent: 2
        },
        preload: fs.readdirSync('./locales/').filter(d => d !== 'dev'),
        debug: false
      }).then(() => {
        return resolve(i18next)
      })
    })
  };

  static get i18next () {
    return i18next
  };
};

module.exports = I18N
