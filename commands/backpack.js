const Server = require('../structures/Server.js')
const { i18next } = require('../structures/i18next.js')

exports.run = async (FM, args, reply, lng, FN) => {
  if (!args[0]) {
    return await reply(i18next.t('args_missing', { ns: 'bot', lng }))
  };
  let query = args.join(' ')
  let displayName = query
  const Request = await Server.searchCosmetic(query, 'backpack')
  if (Request.data) {
    if (Request.data.id) { query = Request.data.id };
    if (Request.data.name) {
      if (Request.data.name[lng]) {
        displayName = Request.data.name[lng]
      } else {
        displayName = Request.data.name.en
      };
    };
  };

  await FN.party.me.setBackpack(query)
  FN.currentLoadout.backpack = query
  if (FN.currentLoadout.emote) {
    await FN.party.me.clearEmote()
    await FN.party.me.setEmote(FN.currentLoadout.emote)
  };
  return await reply(i18next.t('msg_bpchanged', { ns: 'bot', lng, backpack: displayName }))
}

exports.ownerOnly = false
exports.groupOnly = true
