const { i18next } = require('../structures/i18next.js')

exports.run = async (FM, args, reply, lng, FN) => {
  if (!args[0]) {
    return await reply(i18next.t('args_missing', { ns: 'bot', lng }))
  };
  const user = args.join(' ')
  try {
    const Profile = await FN.getProfile(user)
    const Member = FN.party.members.find(member => member.id === Profile.id)
    if (!Member) {
      return reply(i18next.t('kick.not_in_party', { ns: 'bot', lng }))
    };
    await FN.party.kick(Profile.id)
    return reply(i18next.t('kick.success', { ns: 'bot', lng, username: `[${Profile.displayName}]` }))
  } catch (err) {
    return reply(i18next.t('kick.error', { ns: 'bot', lng }))
  };
}

exports.ownerOnly = true
exports.groupOnly = true
