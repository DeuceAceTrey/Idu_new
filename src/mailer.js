const mailgun = require("mailgun-js");

const fauxMailer = {
    messages: () => ({
        send: (details, cb) => {
            console.log(details);
            cb(null, details);
        },
    }),
};

const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env;
const mailer = MAILGUN_API_KEY
    ? mailgun({
          apiKey: process.env.MAILGUN_API_KEY,
          domain: process.env.MAILGUN_DOMAIN,
      })
    : fauxMailer;

module.exports = mailer;
