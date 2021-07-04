let inherits = require('inherits')
let Base = require('cipher-base')
let Buffer = require('buffer').Buffer

let sha = require('sha.js')

function Hmac(alg, key) {
  Base.call(this, 'digest')
  if (typeof key === 'string') {
    key = Buffer.from(key)
  }

  let blocksize = alg === 'sha512' || alg === 'sha384' ? 128 : 64

  this._alg = alg
  this._key = key
  if (key.length > blocksize) {
    let hash = sha(alg)
    key = hash.update(key).digest()
  }

  let ipad = (this._ipad = Buffer.allocUnsafe(blocksize))
  let opad = (this._opad = Buffer.allocUnsafe(blocksize))

  for (let i = 0; i < blocksize; i++) {
    ipad[i] = key[i] ^ 0x36
    opad[i] = key[i] ^ 0x5c
  }
  this._hash = sha(alg)
  this._hash.update(ipad)
}

inherits(Hmac, Base)

Hmac.prototype._update = function(data) {
  this._hash.update(data)
}

Hmac.prototype._final = function() {
  let h = this._hash.digest()
  let hash = sha(this._alg)
  return hash
    .update(this._opad)
    .update(h)
    .digest()
}

module.exports = function createHmac(alg, key) {
  alg = alg.toLowerCase()
  return new Hmac(alg, key)
}
