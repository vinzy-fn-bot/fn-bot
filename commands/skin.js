const Server = require('../structures/Server.js')
const { i18next } = require('../structures/i18next.js')

exports.run = async (FM, args, reply, lng, FN) => {
  if (!args[0]) {
    return await reply(i18next.t('args_missing', { ns: 'bot', lng }))
  };
  let query = args.join(' ')
  let displayName = query
  let setBackpack = false
  const Request = await Server.searchCosmetic(query, 'skin')
  if (Request.data) {
    if (Request.data.id) { query = Request.data.id };
    if (Request.data.name) {
      if (Request.data.name[lng]) {
        displayName = Request.data.name[lng]
      } else {
        displayName = Request.data.name.en
      };
    };
    if (Request.data.matches && Request.data.matches.length > 0) {
      if (Request.data.matches.filter(p => p.type === 'backpack').length === 1) {
        setBackpack = Request.data.matches.filter(p => p.type === 'backpack')[0].id
      };
    };
  };

  await FN.party.me.setOutfit(query)
  FN.currentLoadout.skin = query
  if (setBackpack && !FN.currentLoadout.backpack) {
    await FN.party.me.setBackpack(setBackpack)
  };
  if (FN.currentLoadout.emote) {
    await FN.party.me.clearEmote()
    await FN.party.me.setEmote(FN.currentLoadout.emote)
  };
  return await reply(i18next.t('msg_skinchanged', { ns: 'bot', lng, skin: displayName }))
}

exports.ownerOnly = false
exports.groupOnly = true
