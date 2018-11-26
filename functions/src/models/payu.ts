export interface Account {
  merchant: Merchant;
  accountId: number;
  merchantId: number;
}

export interface Merchant {
  apiKey: string;
  apiLogin: string;
}

export interface PayCard {
  description: string; // transaction description
  txValue: number; // payment amount
  buyerInfo: payBuy; // buier info
  payerInfo: payBuy; //  CC owner info
  COOKIE: string;
  SESSIONID: string;
  ccNumber: string;
  ccSecurityCode: string;
  ccExpirationDate: string;
  ccName: string;
  ccType: string;
}

export interface ICardToken {
  payerId: string // key of user card
  name: string // name of user card
  identificationNumber: string // identification number of user card
  paymentMethod: string // type of card, exp visa, mastercard ...
  number: string // number of card
  expirationDate: string // aaaa/mm
}

export interface payBuy {
  name: string;
  email: string;
  shipping: {
    adress: string;
    city: string;
    state: string;
    country: "CO" | "AR" | "BR" | "MX" | "PA" | "PE" | "CL";
    phone: string;
  };
}
