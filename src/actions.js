const mail = require("./mail");
const mailer = require("./mailer");

const Admin = require("./models/Admin");
const Client = require("./models/Client");
const Contact = require("./models/Contact");
const Hole = require("./models/Hole");
const File = require("./models/File");

const _clone = require("lodash/clone");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const createAdmin = (username, plainTextPassword) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    const password = bcrypt.hashSync(plainTextPassword, salt);
    return Admin.create({
        username,
        password,
        salt,
    });
};

const createHole = (d) => {
    return Hole.create(d).then((hole) => {
        Promise.all(d.files.map((d3) => File.create(d3))).then((files) => {
            hole.setFiles(files);
        });
        return hole;
    });
};

const createClient = (d) => {
    d = _clone(d);
    d.contacts = d.contacts || [];
    d.holes = d.holes || [];
    return Client.create(d).then((client) => {
        return Promise.all([
            Promise.all(d.contacts.map(createContact)).then((contacts) => {
                return client.addContacts(contacts);
            }),

            Promise.all(d.holes.map(createHole)).then((holes) => {
                return client.setHoles(holes);
            }),
        ]);
    });
};

const createContact = (d) => {
    return Contact.findOne({ where: { email: d.email } }).then((contact) => {
        if (contact) {
            return contact;
        }
        d = _clone(d);
        d.salt = bcrypt.genSaltSync(saltRounds);
        d.password = bcrypt.hashSync(d.password, d.salt);
        return Contact.create(d);
    });
};

// Note this throttles only by Contact, not Contact+Hole
const THROTTLE_NOTIFICATION_EMAIL_SECONDS = 60;
let notificationEmailQueue = {};
const notifyContactsOfUpload = (holeId) => {
    Hole.findById(holeId).then((hole) => {
        const promises = [
            Client.findById(hole.clientId),
            hole.getFiles(),
            Contact.findAll({ where: { clientId: hole.clientId } }),
        ];

        Promise.all(promises).then(([client, files, contacts]) => {
            contacts.forEach((contact) => {
                const id = contact.id;
                const mailModel = { contact, hole, files };
                if (notificationEmailQueue[id]) {
                    clearTimeout(notificationEmailQueue[id]);
                }
                notificationEmailQueue[id] = setTimeout(() => {
                    mailer.messages().send(
                        {
                            to: contact.email,
                            from: mail.FROM,
                            subject: mail.uploadNotification.subject(hole.code),
                            text: mail.uploadNotification.text(mailModel),
                            html: mail.uploadNotification.html(mailModel),
                        },
                        (error, body) => {
                            if (error) {
                                console.warn(error);
                            }
                            console.log(body);
                        }
                    );
                }, THROTTLE_NOTIFICATION_EMAIL_SECONDS * 1000);
            });
        });
    });
};

const messageAdminFromClient = (client, contact, file, message) => {
    const mailModel = {
        client,
        contact,
        file,
        message,
    };
    mailer.messages().send(
        {
            to: mail.FROM, // 'Logging Down Under <peter@loggingdownunder.com>'
            from: mail.FROM,
            subject: mail.messageAdmin.subject(file.name),
            text: mail.messageAdmin.text({ mailModel }),
            html: mail.messageAdmin.html(mailModel),
        },
        () => {
            console.log("Message to admin sent");
        }
    );
};

module.exports = {
    createAdmin,
    createHole,
    createClient,
    createContact,
    notifyContactsOfUpload,
    messageAdminFromClient,
};
