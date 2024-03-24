function encodeOddsAndCommenceTime(odds, commenceTime) {
    const [numerator, denominator] = odds.split(':').map(Number);
    // Adjust sizes here and in Solidity if this assumption doesn't hold.
    const numeratorBigInt = BigInt(numerator);
    const denominatorBigInt = BigInt(denominator);

    // CommenceTime should fit within 32 bits, adjust if necessary
    const encodedCommenceTime = BigInt(commenceTime);

    // Combine encodedOdds and encodedCommenceTime into one uint256
    // encodedOdds occupies the higher bits and encodedCommenceTime the lower
    return (numeratorBigInt << 8n) | (denominatorBigInt << 16n) | (encodedCommenceTime << 32n);
}

function decodeOddsAndCommenceTime(encoded) {
    const encodedBigInt = BigInt(encoded);

    const commenceTime = Number(encodedBigInt >> 32n);
    const denominator = Number((encodedBigInt >> 16n) & 0xffn);
    const numerator = Number((encodedBigInt >> 8n) & 0xffn);

    return {
        odds: `${numerator}:${denominator}`,
        commenceTime: new Date(commenceTime * 1000),
        commenceTimeStamp: commenceTime,
    };
}

// Example usage:
const odds = '10:1';
const commenceTime = Math.floor(new Date('2025-12-25T12:00:00Z').getTime() / 1000);
console.log(commenceTime);
const encoded = encodeOddsAndCommenceTime(odds, commenceTime);
console.log(`Encoded: ${encoded}`);

// Example usage:
const decoded = decodeOddsAndCommenceTime(encoded);
console.log(`Decoded: ${JSON.stringify(decoded)}`);
console.log(decoded.commenceTimeStamp === commenceTime);
