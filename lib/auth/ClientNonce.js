const HEX = '0123456789abcdef';

class ClientNonce {
  static get(numBytes) {
    const bytes = new Uint8Array(numBytes);
    const random = window.crypto.getRandomValues(bytes);
    const result = [];
    random.forEach((c) => {
      const hi = HEX[Math.floor(c / 16)];
      result.push(hi);
      const lo = HEX[c % 16];
      result.push(lo);
    });
    return result.join('');
  }
}

export default ClientNonce;
