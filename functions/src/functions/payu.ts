import * as functions from "firebase-functions";
import { Account, ICardToken, Merchant, PayCard } from "../models/payu";
import * as rq from "request-promise-native";
import * as md5 from "md5";
const cors = require("cors")({ origin: true });

const url_payu = functions.config().payu.endpoint;
const CURRENCY = "COP";
const account: Account = {
  merchant: {
    apiKey: functions.config().payu.api_key,
    apiLogin: functions.config().payu.api_login
  },
  accountId: Number(functions.config().payu.account_id),
  merchantId: Number(functions.config().payu.merchant_id)
};

export const ping = functions.https.onRequest(async (req, resp) => {
  const body = {
    command: "PING"
  };
  const respond = await payuRequest(`${url_payu}reports-api/4.0/service.cgi`, body);
  resp.json(respond);
});

export const payWithCC = functions.https.onRequest(async (req, resp) => {
  cors(req, resp, async () => {
    const data: PayCard = req.body;
    const code = `FINCAPP_${Date.now()}`;
    const signature = md5(`${account.merchant.apiKey}~${account.merchantId}~${code}~${data.txValue}~${CURRENCY}`);
    const bodyPayu = {
      command: "SUBMIT_TRANSACTION",
      transaction: {
        order: {
          accountId: account.accountId,
          referenceCode: code,
          description: data.description,
          language: "es",
          signature: signature,
          notifyUrl: "http://www.tes.com/confirmation",
          additionalValues: {
            TX_VALUE: {
              value: data.txValue,
              currency: "COP"
            },
            TX_TAX: {
              value: 0,
              currency: "COP"
            },
            TX_TAX_RETURN_BASE: {
              value: 0,
              currency: "COP"
            }
          },
          buyer: {
            fullName: data.buyerInfo.name,
            emailAddress: data.payerInfo.email,
            shippingAddress: {
              street1: data.buyerInfo.shipping.adress,
              city: data.buyerInfo.shipping.city,
              state: data.buyerInfo.shipping.state,
              country: data.buyerInfo.shipping.country,
              phone: data.buyerInfo.shipping.phone
            }
          },
          shippingAddress: {
            street1: data.buyerInfo.shipping.adress,
            city: data.buyerInfo.shipping.city,
            state: data.buyerInfo.shipping.state,
            country: data.buyerInfo.shipping.country,
            phone: data.buyerInfo.shipping.phone
          }
        },
        payer: {
          fullName: data.buyerInfo.name,
          emailAddress: data.payerInfo.email,
          billingAddress: {
            street1: data.buyerInfo.shipping.adress,
            city: data.buyerInfo.shipping.city,
            state: data.buyerInfo.shipping.state,
            country: data.buyerInfo.shipping.country,
            phone: data.buyerInfo.shipping.phone
          }
        },
        creditCard: {
          number: data.ccNumber,
          securityCode: data.ccSecurityCode,
          expirationDate: data.ccExpirationDate,
          name: data.ccName
        },
        extraParameters: {
          INSTALLMENTS_NUMBER: 1
        },
        type: "AUTHORIZATION_AND_CAPTURE",
        paymentMethod: data.ccType,
        paymentCountry: "CO",
        deviceSessionId: data.SESSIONID,
        ipAddress: req.headers["x-forwarded-for"] || req.connection.remoteAddress || "127.0.0.1",
        cookie: data.COOKIE,
        userAgent: req.get("User-Agent") || "Mozilla/5.0 (Windows NT 5.1; rv:18.0) Gecko/20100101 Firefox/18.0"
      }
    };
    try {
      const respond = await payuRequest(`${url_payu}payments-api/4.0/service.cgi`, bodyPayu);
      console.log(respond);
      resp.send(JSON.stringify(respond));
    } catch (e) {
      console.error(JSON.stringify(e));
      resp.send(e);
    }
  });
});

export const createToken = functions.https.onRequest(async (req, resp) => {
  const cardData: ICardToken = req.body;
  const body = {
    command: "CREATE_TOKEN",
    creditCardToken: cardData
  };
  const respond = await payuRequest(`${url_payu}payments-api/4.0/service.cgi`, body);
  console.log(respond);
  resp.send(JSON.stringify(respond));
});

function payuRequest(uri: string, body: {}) {
  const options = {
    method: "POST",
    uri,
    body: {
      ...body,
      test: false,
      language: "es",
      merchant: account.merchant
    },
    json: true
  };
  console.log(JSON.stringify(options.body));
  return rq(options);
}
