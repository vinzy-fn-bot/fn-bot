const beautify = require('json-beautify')
const fs = require('fs')

function configValid (cf) {
  if (typeof cf !== 'object') { return false };
  if (!cf.bot || !cf.bot.party_privacy || !cf.bot.owner) { return false };
  if (!cf.bot.autoSitOut && cf.bot.autoSitOut !== false) { return false };
  if (!cf.server_url || !cf.preferred_language) { return false };
  return true
};

JSON.beautify = function (object) {
  return beautify(object, null, 4, 100)
};

(async () => {
  if (process.argv[2] && process.argv[2] === '-r') {
    return require('./setup.js')
  } else {
    try {
      const config = JSON.parse(fs.readFileSync(process.cwd() + '/config.json', { encoding: 'utf8' }))
      const configV = configValid(config)
      if (!configV) {
        return require('./setup.js')
      } else {
        return require('./index_nogui.js')
      };
    } catch (err) {
      return require('./setup.js')
    };
  };
})()
