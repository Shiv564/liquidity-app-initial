// utils/Wallet.js 
const { HDNodeWallet } = require('ethers');

function deriveWallet(index) {
    const mnemonic = "test test test test test test test test test test test junk";
    const derivationPath = `44'/60'/0'/0/${index}`;

    // Create root wallet from mnemonic phrase
    const rootWallet = HDNodeWallet.fromPhrase(mnemonic);

    // Derive child wallet with the given path
    const childWallet = rootWallet.derivePath(derivationPath);

    return {
        address: childWallet.address,
        privateKey: childWallet.privateKey,
    };
}

module.exports = { deriveWallet };
