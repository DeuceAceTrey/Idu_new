const sequelize = require("./connection");
const generator = require("generate-password");
const mail = require("./mail");
const {
    createAdmin,
    createHole,
    createClient,
    createContact,
} = require("./actions");

const { Hole, File, Client, Contact } = require("./models");

const mailer = require("./mailer");

const PASSWORD_OPTS = {
    uppercase: false,
    numbers: true,
    excludeSimilarCharacters: true,
};

const checkContactExists = (req, res, next) => {
    const { email } = req.body;
    Contact.findOne({ where: { email } }).then((contact) => {
        if (contact) {
            return res.status(200).send({ message: "Exists" });
        } else {
            res.status(404).send({ message: "Not Found" });
        }
    });
};

const createNewClient = (req, res) => {
    const { clientName, contactName, contactEmail, contactRole } = req.body;
    const password = generator.generate(PASSWORD_OPTS);
    const contactData = {
        name: contactName,
        email: contactEmail,
        role: contactRole,
        password,
    };
    const clientData = {
        name: clientName,
        contacts: [contactData],
    };
    Contact.findOne({ where: { email: contactEmail } }).then((contact) => {
        createClient(clientData)
            .then((client, err) => {
                if (contact) {
                    const mailData = {
                        contact: contact.name,
                        client: clientName,
                    };
                    mailer.messages().send(
                        {
                            to: contactEmail,
                            from: mail.FROM,
                            subject: mail.addedToClient.subject(clientName),
                            text: mail.addedToClient.text(mailData),
                            html: mail.addedToClient.html(mailData),
                        },
                        (error, body) => {
                            if (error) {
                                console.warn(error);
                            }
                            // console.log(body)
                        }
                    );
                } else {
                    const mailData = {
                        ...contactData,
                        password,
                    };
                    mailer.messages().send(
                        {
                            to: contactEmail,
                            from: mail.FROM,
                            subject: mail.welcome.subject(clientName),
                            text: mail.welcome.text(mailData),
                            html: mail.welcome.html(mailData),
                        },
                        (error, body) => {
                            if (error) {
                                console.warn(error);
                            }
                            // console.log(body)
                        }
                    );
                }
                res.send("ok");
            })
            .catch((err) => {
                res.status(500).send(err);
            });
    });
};

const createNewContact = (req, res, next) => {
    const password = generator.generate(PASSWORD_OPTS);
    const { email, name, role, clientId } = req.body;
    const contactData = {
        name: name,
        email: email,
        role: role,
        password,
    };
    Contact.findOne({ where: { email } }).then((contact) => {
        if (contact) {
            Client.findById(clientId).then((client) => {
                client.addContact(contact);
                const mailData = {
                    contact: contact.name,
                    client: client.name,
                };
                mailer.messages().send(
                    {
                        to: email,
                        from: mail.FROM,
                        subject: mail.addedToClient.subject(client.name),
                        text: mail.addedToClient.text(mailData),
                        html: mail.addedToClient.html(mailData),
                    },
                    (error, body) => {
                        if (error) {
                            console.warn(error);
                        }
                        // console.log(body)
                    }
                );
                res.send(contact);
            });
        } else {
            const promises = [
                Client.findById(clientId),
                createContact({ email, password, name, role, clientId }),
            ];
            Promise.all(promises).then(([client, contact]) => {
                client.addContact(contact);
                const mailData = {
                    ...contactData,
                    password,
                };
                mailer.messages().send(
                    {
                        to: email,
                        from: mail.FROM,
                        subject: mail.welcome.subject(client.name),
                        text: mail.welcome.text(mailData),
                        html: mail.welcome.html(mailData),
                    },
                    (error, body) => {
                        if (error) {
                            console.warn(error);
                        }
                        // console.log(body)
                    }
                );
                res.send(contact);
            });
        }
    });
};

const removeHole = (req, res, next) => {
    const { id } = req.params;
    const handleError = (err) => res.status(500).send(err);
    const client = require("./s3-client");
    const stream = client.deleteDir({
        Bucket: "ldu-test",
        Prefix: "/public/uploads" + id + "/",
    });
    stream.on("end", () => {
        console.log(`Deleted all files for Hole ${id} on S3`);
    });
    // TODO: trigger S3 delete
    Hole.destroy({ where: { id } })
        .then((d) => {
            File.destroy({ where: { holeId: id } })
                .then((hole) => {
                    res.send("OK");
                })
                .catch(handleError);
        })
        .catch(handleError);
};

const removeClient = (req, res, next) => {
    const { id } = req.params;
    Client.findById(id).then((client) => {
        client.getHoles().then((holes) => {
            holes.forEach((hole) => {
                removeHole(
                    {
                        params: { id: hole.id },
                    },
                    res,
                    next
                );
            });
        });
        const sql = `DELETE FROM client_contact WHERE clientId='${id}'`;
        sequelize.query(sql).spread((results, metadata) => {
            client.destroy().then((client) => {
                res.send("OK");
            });
        });
    });
};

const removeClientContact = (req, res, next) => {
    const { contactId, clientId } = req.params;
    Contact.findById(contactId).then((contact) => {
        const sql = `DELETE FROM client_contact WHERE contactId='${contactId}' AND clientId=${clientId}`;
        sequelize.query(sql).spread((results, metadata) => {
            // TODO: if !contact.clients.length then destroy
            // contact.destroy().then(contact => {
            //     res.send('OK')
            // })
            res.send("OK");
        });
    });
};

const viewClient = (req, res) => {
    const activeTab = req.query.tab || "holes";
    Client.findById(req.params.id).then((client) => {
        if (!client) {
            return res.status(404).send({ message: "Not Found" });
        }
        const promise = Promise.all([client.getContacts(), client.getHoles()]);
        return promise.then(([contacts, holes]) => {
            res.render("admin/client", {
                client,
                contacts,
                holes: holes.sort((a, b) => a.code.localeCompare(b.code)),
                activeTab,
                admin: {
                    email: req.user.admin.username,
                    name: req.user.admin.username.split("@").shift(),
                },
            });
        });
    });
};

const listClients = (req, res) => {
    Client.findAll().then((clients) => {
        if (clients) {
            clients.map((client) => {
                return client;
            });
            res.render("admin/overview", {
                clients,
                admin: {
                    email: req.user.admin.username,
                    name: req.user.admin.username.split("@").shift(),
                },
            });
        }
    });
};

const getNumberOfContacts = (req, res) => {
    const { clientId } = req.query;
    Client.findById(clientId).then((client) => {
        if (!client) {
            return res.status(404).send({ mesage: "Not Found" });
        }
        client.getContacts().then((contacts) => {
            res.send({ length: contacts.length });
        });
    });
};

module.exports = {
    createNewClient,
    createNewContact,
    removeHole,
    removeClient,
    removeClientContact,
    viewClient,
    listClients,
    checkContactExists,
    getNumberOfContacts,
};
