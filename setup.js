const { prompt } = require('inquirer')
const fs = require('fs')
const pkgfile = require('./package.json')

function convertOldConfig (cfg) {
  const newformat = {
    bot: {
      party_privacy: 'public',
      autoSitOut: false,
      acceptallfriends: true,
      owner: null
    },
    server_url: 'https://fnapi.terax235.com',
    preferred_language: 'en',
    auth: null
  }
  if (cfg.bot) {
    if (cfg.bot.party_privacy) { newformat.bot.party_privacy = cfg.bot.party_privacy };
    if (cfg.bot.autoSitOut) { newformat.bot.autoSitOut = cfg.bot.autoSitOut };
    if (cfg.bot.acceptallfriends) { newformat.bot.acceptallfriends = cfg.bot.acceptallfriends };
    if (cfg.bot.owner) { newformat.bot.owner = cfg.bot.owner };
  };
  if (cfg.server_url) { newformat.server_url = cfg.server_url };
  if (cfg.preferred_language) { newformat.preferred_language = cfg.preferred_language };
  return newformat
};

let config = {}
try {
  config = require(process.cwd() + '/config.json', 'must-exclude')
  if (config.bot.login || config.build) { config = convertOldConfig(config) }
} catch (err) {
  config = {
    bot: {}
  }
};

const LocalizationNames = {
  en: 'English',
  de: 'German',
  it: 'Italian',
  fr: 'French',
  ro: 'Romanian',
  ar: 'Arabic',
  ru: 'Russian'
}

prompt([{
  type: 'list',
  name: 'locale',
  message: 'Please select your language.',
  prefix: '',
  suffix: '',
  choices: async function () {
    try {
      const locales = await fs.readdirSync('./locales/')
      return locales.filter(l => l !== 'dev').map(locale => { if (LocalizationNames[locale]) { return { name: LocalizationNames[locale], value: locale } } else { return { name: locale, value: locale } } }).sort()
    } catch (err) {
      console.log('[Error] Could not load locales. Seems like the locales directory is missing.')
      setTimeout(async () => {
        process.exit(1)
      }, 10000)
      return []
    };
  }
}]).then(answers1 => {
  const i18next = require('i18next')
  const Backend = require('i18next-node-fs-backend')
  i18next.use(Backend).init({
    ns: ['setup'],
    defaultNS: 'setup',
    fallbackLng: [answers1.locale],
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json',
      addPath: './locales/{{lng}}/{{ns}}.missing.json',
      jsonIndent: 2
    },
    preload: [answers1.locale],
    debug: false
  }).then(async () => {
    console.log('\n' + i18next.t('welcome', {
      project_name: pkgfile.name
    }) + '\n')
    prompt([
      {
        type: 'input',
        name: 'server_url',
        message: i18next.t('cosmetic_server.msg'),
        prefix: '-',
        suffix: ':',
        default: function () {
          if (config.server_url) return config.server_url
          return 'https://fnapi.terax235.com'
        }
      },
      {
        type: 'confirm',
        name: 'allow_invites',
        message: i18next.t('allow_invites_msg'),
        prefix: '-',
        suffix: '?'
      },
      {
        type: 'confirm',
        name: 'accept_friends',
        message: i18next.t('accept_friends_msg'),
        prefix: '-',
        suffix: '?'
      },
      {
        type: 'confirm',
        name: 'auto_sit_out',
        message: i18next.t('auto_sit_out_msg'),
        prefix: '-',
        suffix: '?'
      },
      {
        type: 'input',
        name: 'bot_owner',
        message: i18next.t('bot_owner_msg'),
        prefix: '-',
        suffix: ':',
        default: function () {
          if (config.bot.owner) return config.bot.owner
        }
      }
    ]).then(async answers => {
      // Build config
      config = { bot: {} }
      config.server_url = answers.server_url
      config.preferred_language = answers1.locale
      config.bot.party_privacy = 'public'
      config.bot.acceptInvites = answers.allow_invites
      config.bot.autoSitOut = answers.auto_sit_out
      config.bot.acceptallfriends = answers.accept_friends
      config.bot.owner = answers.bot_owner
      if (config.server_url.split('')[config.server_url.split('').length - 1] === '/') {
        config.server_url = config.server_url.split('').slice(0, config.server_url.split('').length - 1).join('')
      };
      fs.writeFile(process.cwd() + '/config.json', JSON.beautify(config), (err) => {
        if (err) throw err
        console.log('\n' + i18next.t('done') + '\n')
        setTimeout(async () => {
          require('./index.js')
        }, 5000)
      })
    })
  })
})
