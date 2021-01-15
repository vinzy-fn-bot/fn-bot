const { i18next } = require('../structures/i18next.js')

exports.run = async (FM, args, reply, lng, FN) => {
  if (!args[0]) { return await reply(i18next.t('args_missing', { ns: 'bot', lng })) };
  const user = args.join(' ')
  try {
    const Profile = await FN.getProfile(user)
    const isFriended = await FN.friends.find(friend => friend.id === Profile.id)
    if (!isFriended) {
      return await reply(i18next.t('rmvfriend.not_friended', { ns: 'bot', lng }))
    };
    await FN.removeFriend(Profile.id)
    return await reply(i18next.t('rmvfriend.success', { ns: 'bot', lng, username: `[${Profile.displayName}]` }))
  } catch (err) {
    return await reply(i18next.t('rmvfriend.error', { ns: 'bot', lng }))
  };
}

exports.ownerOnly = true
exports.groupOnly = false
