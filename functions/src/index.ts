import Payu = require('./functions/payu');

exports.payu_ping = Payu.ping;
exports.payu_paycc = Payu.payWithCC;
exports.payu_create_token = Payu.createToken;
