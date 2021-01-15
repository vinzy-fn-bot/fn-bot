const { i18next } = require('../structures/i18next.js')

exports.run = async (FM, args, reply, lng, FN) => {
  if (!args[0]) {
    return await reply(i18next.t('args_missing', { ns: 'bot', lng }))
  };
  const user = args.join(' ')
  try {
    const Profile = await FN.getProfile(user)
    const Member = FN.party.members.find(member => member.id === Profile.id)
    if (Member) {
      return reply(i18next.t('invite.is_in_party', { ns: 'bot', lng }))
    };
    await FN.party.invite(Profile.id)
    return reply(i18next.t('invite.success', { ns: 'bot', lng, username: `[${Profile.displayName}]` }))
  } catch (err) {
    return reply(i18next.t('invite.error', { ns: 'bot', lng }))
  };
}

exports.ownerOnly = true
exports.groupOnly = false
