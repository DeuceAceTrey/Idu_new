const fs = require("fs");
const handlebars = require("handlebars");

const readFile = (name) => fs.readFileSync(`./views/mail/${name}`, "utf8");
const getTemplate = (name) => handlebars.compile(readFile(name));

const mail = {
    FROM: "Logging Down Under <peter@loggingdownunder.com>",
    welcome: {
        subject: (name) => `Logging Down Under shared "${name}" with you`,
        text: getTemplate("welcome.txt"),
        html: getTemplate("welcome.handlebars"),
    },
    addedToClient: {
        subject: (name) => `Logging Down Under shared "${name}" with you`,
        text: getTemplate("added-to-client.txt"),
        html: getTemplate("added-to-client.handlebars"),
    },
    uploadNotification: {
        subject: (code) => `New files from Logging Down Under(${code})`,
        text: getTemplate("upload-notification.txt"),
        html: getTemplate("upload-notification.handlebars"),
    },
    messageAdmin: {
        subject: (name) => `Question about File ${name}`,
        text: getTemplate("message-admin.txt"),
        html: getTemplate("message-admin.txt"), // WARNING: txt
    },
};

module.exports = mail;
