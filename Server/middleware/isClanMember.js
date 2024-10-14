async function isClanMember(req, res, next) {
    const { userId } = req;
    const { clanId } = req.params; // Assuming `clanId` is passed as a route param

    try {
        const clan = await Clan.findById(clanId);

        if (!clan) {
            return res.status(404).json({ message: 'Clan not found' });
        }

        if (!clan.members.includes(userId)) {
            return res.status(403).json({ message: 'You are not a member of this clan' });
        }

        // If the user is a member, proceed to the next middleware or route handler
        next();
    } catch (err) {
        return res.status(500).json({ message: `Error checking clan membership: ${err.message}` });
    }
}

module.exports = isClanMember;