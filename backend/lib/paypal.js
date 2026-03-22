const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

const environment = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (process.env.PAYPAL_ENVIRONMENT === 'production') {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  }

  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
};

const client = () => {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
};

module.exports = { client };
