exports.receiveDeposit = async (req, res) => {
    try {
        const { token, token_amount, txHash } = req.body;
        const userId = req.user._id;

        if (!token || !token_amount || !txHash) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const walletAddress = user.wallet?.address;
        if (!walletAddress) {
            return res.status(400).json({ message: 'User wallet address not found.' });
        }

        const existing = await Deposit.findOne({ txHash });
        if (existing) {
            // ✅ Mark user as suspicious (if not already)
            if (!user.isFlaggedForSuspiciousActivity) {
                user.isFlaggedForSuspiciousActivity = true;
                await user.save();
            }

            return res.status(400).json({
                message: 'Duplicate transaction ID detected. Deposit rejected.',
                suspicious: true,
            });
        }

        const deposit = new Deposit({
            user: userId,
            wallet_address: walletAddress,
            token: token.toLowerCase(),
            token_amount: parseFloat(token_amount),
            txHash,
            status: 'Pending',
            isSuspicious: user.isFlaggedForSuspiciousActivity || false
        });

        await deposit.save();

        return res.status(201).json({ message: 'Deposit submitted and pending approval.', deposit });

    } catch (err) {
        console.error('💥 Deposit Error:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
