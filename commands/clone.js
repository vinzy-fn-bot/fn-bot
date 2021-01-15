exports.run = async (Message, args, reply, lng, FN) => {
  const User = Message.author
  if (User.outfit && User.outfit.split('.')[1]) {
    await FN.party.me.setOutfit(User.outfit.split('.')[1])
  };
  if (User.backpack && User.backpack.split('.')[1]) {
    await FN.party.me.setBackpack(User.backpack.split('.')[1])
  };
  if (User.pickaxe && User.pickaxe.split('.')[1]) {
    await FN.party.me.setPickaxe(User.pickaxe.split('.')[1])
  };
  if (User.emote && User.emote.split('.')[1]) {
    await FN.party.me.setEmote(User.emote.split('.')[1])
  };
}

exports.groupOnly = true
