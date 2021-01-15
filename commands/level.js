const { i18next } = require('../structures/i18next.js')

exports.run = async (Message, args, reply, lng, FN) => {
  if (!args[0]) {
    return await reply(i18next.t('args_missing', { ns: 'bot', lng }))
  };
  const level = parseInt(args.join(' '))
  if (level > 9999 || level < 1) { return };
  await FN.party.me.setLevel(level)
}

exports.ownerOnly = true
