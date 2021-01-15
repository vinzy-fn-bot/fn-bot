const Fortnite = require('./structures/Fortnite.js')
const Server = require('./structures/Server.js')
const I18N = require('./structures/i18next.js')
const path = require('path')
const fs = require('fs')
const pkgfile = require('./package.json')
const config = require(process.cwd() + '/config.json', 'must-exclude')

const I18NPromise = new I18N()

const commands = {}

// Load commands
fs.readdir(path.join(__dirname, './commands/'), (err, files) => {
  if (err) { throw err };
  files.forEach(file => {
    const f = require(path.join(__dirname, `./commands/${file}`))
    if (!f.run) return
    commands[file.split('.')[file.split('.').length - 2]] = f
  })
})

I18NPromise.then(async i18next => {
  const server = new Server({
    url: config.server_url,
    version: pkgfile.serverVersion
  })
  if (typeof server === 'object' && server.error) {
    if (server.msg === 'baseurl_missing') {
      console.log(i18next.t('Server.baseurl_missing', {
        ns: 'errors',
        lng: config.preferred_language
      }))
      process.exit(1)
    };
  };
  server.checkStatus().then(async status => {
    const FN = await Fortnite.init(config)
    let setLoadout = false
    if (!FN.party.chat.connected) {
      FN.party.chat.join()
    };
    FN.on('party:member:joined', async PartyMember => {
      if (!FN.party.chat.connected) {
        FN.party.chat.join()
      };
      if (!setLoadout) {
        if (config.defaultLoadout) {
          if (config.defaultLoadout.skin) { FN.party.me.setOutfit(config.defaultLoadout.skin) };
          if (config.defaultLoadout.backpack) { FN.party.me.setBackpack(config.defaultLoadout.backpack) };
          if (config.defaultLoadout.emote) { FN.party.me.setEmote(config.defaultLoadout.emote); FN.currentLoadout.emote = config.defaultLoadout.emote };
          if (config.defaultLoadout.level) { FN.party.me.setLevel(config.defaultLoadout.level) };
          if (config.defaultLoadout.banner) { FN.party.me.setBanner(config.defaultLoadout.banner.id, config.defaultLoadout.banner.color) };
        } else {
          FN.party.me.setOutfit('CID_434_Athena_Commando_F_StealthHonor')
          FN.party.me.setLevel(999)
          FN.party.me.setBanner('brs9lvl100', 'defaultcolor22')
        };
        setLoadout = true
      };
      if (PartyMember.id !== FN.id && !FN.currentLoadout.emote) {
        setTimeout(() => {
          FN.party.me.setEmote('EID_Wave')
          setTimeout(() => {
            FN.party.me.clearEmote()
          }, 3000)
        }, 1000)
      };
    })
    FN.on('friend:message', async FriendMessage => {
      if (!FN.party || !FN.party.me) { return };
      const command = FriendMessage.content.split(' ')[0]
      const args = FriendMessage.content.split(' ').slice(1)
      if (commands[command.toLowerCase()]) {
        const cmd = commands[command.toLowerCase()]
        if (cmd.groupOnly && !FN.party.members.find(member => member.id === FriendMessage.author.id)) {
          return await FriendMessage.reply(i18next.t('msg_notingroup', { ns: 'bot', lng: config.preferred_language }))
        }
        if (cmd.ownerOnly && FriendMessage.author.id !== FN.owner.id) {
          return await FriendMessage.reply(i18next.t('msg_owneronly', { ns: 'bot', lng: config.preferred_language }))
        };
        return await cmd.run(FriendMessage, args, (content) => { return FN.sendFriendMessage(FriendMessage.author.id, content) }, config.preferred_language, FN)
      };
    })
    FN.on('party:member:message', async PartyMessage => {
      if (!FN.party || !FN.party.me) { return };
      const command = PartyMessage.content.split(' ')[0]
      const args = PartyMessage.content.split(' ').slice(1)
      if (commands[command.toLowerCase()]) {
        const cmd = commands[command.toLowerCase()]
        if (cmd.ownerOnly && PartyMessage.author.id !== FN.owner.id) {
          return await FN.party.sendMessage(i18next.t('msg_owneronly', { ns: 'bot', lng: config.preferred_language }))
        };
        return await cmd.run(PartyMessage, args, (content) => { FN.party.sendMessage(content) }, config.preferred_language, FN)
      };
    })
    setInterval(async () => {
      await server.checkStatus()
    }, 1000 * 60 * 2)
  })
})
