const { Client, Enums } = require('fnbr')
const fetch = require('node-fetch')
const { prompt } = require('inquirer')
const opn = require('opn')
const fs = require('fs')

const { i18next } = require('./i18next.js')

const ENDPOINTS = {
  AUTH: 'https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token',
  EXCHANGE: 'https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/exchange',
  REDIRECT: 'https://www.epicgames.com/id/logout?redirectUrl=https%3A//www.epicgames.com/id/login%3FredirectUrl%3Dhttps%253A%252F%252Fwww.epicgames.com%252Fid%252Fapi%252Fredirect%253FclientId%253Dec684b8c687f479fadea3cb2ad83f5c6%2526responseType%253Dcode',
  TOKEN: 'ZWM2ODRiOGM2ODdmNDc5ZmFkZWEzY2IyYWQ4M2Y1YzY6ZTFmMzFjMjExZjI4NDEzMTg2MjYyZDM3YTEzZmM4NGQ='
}

async function getExchangeCode (code) {
  const Login = await fetch(ENDPOINTS.AUTH, { method: 'POST', body: 'grant_type=authorization_code&code=' + code, headers: { Authorization: 'basic ' + ENDPOINTS.TOKEN, 'Content-Type': 'application/x-www-form-urlencoded' } }).then(res => res.json())
  const Exchange = await fetch(ENDPOINTS.EXCHANGE, { headers: { Authorization: 'bearer ' + Login.access_token } }).then(res => res.json())
  return Exchange.code
};

function StartEventHandler (client, options) {
  if (options.acceptallfriends) {
    client.on('friend:request', FriendRequest => {
      return FriendRequest.accept()
    })
  };
  if (options.acceptInvites) {
    client.on('party:invite', PartyInvitation => {
      PartyInvitation.accept()
    })
  };
};

exports.init = async function (options) {
  let client = Client.prototype
  let pendingConfig = false
  const kairosConfig = { cid: 'CID_434_Athena_Commando_F_StealthHonor' }
  if (options.defaultLoadout && options.defaultLoadout.skin) { kairosConfig.cid = options.defaultLoadout.skin };
  if (!options.auth) {
    console.log(i18next.t('generating_auth', { ns: 'console', lng: options.preferred_language, link: ENDPOINTS.REDIRECT }))
    opn(ENDPOINTS.REDIRECT)
    let { auth } = await prompt({ type: 'input', name: 'auth', message: 'Enter the exchange code here: ' })
    if (auth.split('?code=')[1]) {
      auth = auth.split('?code=')[1].split('"')[0]
    };
    const exchangeCode = await getExchangeCode(auth)
    client = new Client({ auth: { exchangeCode }, status: 'FN Lobby Bot by Terax235', kairos: kairosConfig })
  } else {
    client = new Client({ auth: { deviceAuth: options.auth }, status: 'FN Lobby Bot by Terax235', kairos: kairosConfig })
  };
  client.on('deviceauth:created', (credentials) => {
    if (!options.auth || credentials.accountId !== options.auth.accountId) {
      options.auth = credentials
      pendingConfig = true
    };
  })
  console.log('[EGL] ' + i18next.t('login.message', { ns: 'console', lng: options.preferred_language }))
  try {
    await client.login()
    console.log('[EGL] ' + i18next.t('login.success', { ns: 'console', lng: options.preferred_language, username: client.user.displayName, account_id: client.user.id }))
  } catch (error) {
    console.log('[Error] ' + i18next.t('Fortnite.login_failed', { ns: 'errors', lng: options.preferred_language }))
    return process.exit(1)
  };
  if (options.bot.party_privacy && options.bot.party_privacy.toUpperCase() !== 'PUBLIC' && Enums.PartyPrivacy[options.bot.party_privacy.toUpperCase()]) {
    client.party.setPrivacy(Enums.PartyPrivacy[options.bot.party_privacy.toUpperCase()])
  };
  if (options.bot.acceptallfriends) {
    for (const Request of client.pendingFriends.filter(request => request.direction === 'INCOMING').toArray()) {
      for (const key in Request) {
        Request[key].accept()
      }
    };
  };

  client.currentLoadout = {
    skin: null,
    backpack: null,
    pickaxe: null,
    emote: null
  }
  if (options.bot.owner) {
    client.owner = await client.getProfile(options.bot.owner)
    if (options.bot.owner.toLowerCase() === client.owner.displayName.toLowerCase()) {
      options.bot.owner = client.owner.id
      pendingConfig = true
    };
  };
  if (pendingConfig) {
    fs.writeFileSync(process.cwd() + '/config.json', JSON.beautify(options))
  };
  StartEventHandler(client, options.bot)
  return client
}
