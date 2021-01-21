const Server = require('./structures/Server.js')

exports.run = async (FM, args, reply, lng, FN) => {
  if (FN.party && FN.party.me) {
    if (FN.party.me.meta.schema.GameReadiness_s === 'SittingOut') {
      FN.party.me.sendPatch({ GameReadiness_s: 'NotReady' })
    };
    if (FN.party.me.meta.schema.GameReadiness_s === 'NotReady') {
      FN.party.me.sendPatch({ GameReadiness_s: 'SittingOut' })
    };
  };
}

exports.ownerOnly = false
exports.groupOnly = true
