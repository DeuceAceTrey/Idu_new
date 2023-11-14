const path = require("path");
const express = require("express");
const exphbs = require("express-handlebars");
const passport = require("passport");
const epilogue = require("epilogue");
const moment = require("moment");
const secure = require("express-force-https");
const download = require("./download");

// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });

const app = express();
const sequelize = require("./connection");
const {
    authAdmin,
    authClient,
    checkAdminLogin,
    checkClientOwnsHole,
    checkClientLogin,
    authEpilogue,
} = require("./authentication");
const { createAdmin, messageAdminFromClient } = require("./actions");
const admin = require("./admin");

// Config
const PORT = process.env.PORT || 5000;

// Models
const Admin = require("./models/Admin");
const Client = require("./models/Client");
const Hole = require("./models/Hole");
const File = require("./models/File");
const Contact = require("./models/Contact");

const helpers = {
    ifGT: function (v1, v2, options) {
        if (v1 > v2) {
            return options.fn(this);
        }
        return options.inverse(this);
    },
    ifEquals: function (arg1, arg2, options) {
        return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    },
};

const hbs = exphbs.create({
    defaultLayout: false,
    helpers,
});

// View Engine
app.set("views", __dirname + "/../views");
app.set("view engine", "handlebars");
app.engine("handlebars", hbs.engine);

// Middleware
app.use(secure);
app.use("/", express.static(path.resolve("./public")));
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    require("express-session")({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false,
    })
);
// app.use(require('express-fileupload')())
app.use(passport.initialize());
app.use(passport.session());

epilogue.initialize({ app, sequelize });

// Admin Routes
app.get("/admin", checkAdminLogin, admin.listClients);

app.post("/admin/clients/create", checkAdminLogin, admin.createNewClient);

app.delete("/admin/clients/:id", checkAdminLogin, admin.removeClient);

app.post("/admin/contacts/create", checkAdminLogin, admin.createNewContact);

app.post(
    "/admin/remove-client-contact/:clientId/:contactId",
    checkAdminLogin,
    admin.removeClientContact
);

app.post(
    "/admin/check-contact-exists",
    checkAdminLogin,
    admin.checkContactExists
);

app.delete("/admin/holes/:id", checkAdminLogin, admin.removeHole);

app.get("/admin/client/:id", checkAdminLogin, admin.viewClient);

app.get("/admin/login", (req, res) => res.render("admin/index"));

app.post("/admin/login", authAdmin, (req, res) => res.redirect("/admin"));

app.get(
    "/api/get-number-of-contacts",
    checkAdminLogin,
    admin.getNumberOfContacts
);

app.post(
    "/download",
    checkClientLogin,
    download.middleware,
    download.fileDownload
);

// Client Routes
app.get("/client", checkClientLogin, (req, res) => {
    Contact.findById(req.user.contact.id).then((contact) => {
        contact.getClients().then((clients) => {
            res.render("client/list", { clients, contact: req.user.contact });
        });
    });
});

app.get("/client/dashboard/:id", checkClientLogin, (req, res) => {
    Contact.findById(req.user.contact.id).then((contact) => {
        contact.getClients().then((clients) => {
            clients.forEach((client) => {
                if (client.id === parseInt(req.params.id)) {
                    const promise = Promise.all([client.getHoles()]);
                    return promise.then(([holes]) => {
                        res.render("client/profile", {
                            client,
                            holes,
                            contact: req.user.contact,
                        });
                    });
                }
            });
        });
    });
});

app.get("/client/api/holes", checkClientLogin, (req, res) => {
    Client.findById(req.user.contact.clientId).then((client) => {
        client.getHoles().then((holes) => res.send(holes));
    });
});

app.post("/client/send-message", checkClientLogin, (req, res) => {
    const { message, fileId } = req.body;
    const { contact } = req.user;
    Client.findById(contact.clientId)
        .then((client) => {
            File.findById(fileId)
                .then((file) => {
                    messageAdminFromClient(client, contact, file, message);
                    res.send("ok");
                })
                .catch((err) => {
                    console.warn(err);
                    return res.status(500).send(err);
                });
        })
        .catch((err) => {
            console.warn(err);
            return res.status(500).send(err);
        });
});

app.get(
    "/client/api/holes/:holeId",
    checkClientLogin,
    checkClientOwnsHole,
    (req, res) => {
        File.findAll({ where: { holeId: req.params.holeId } }).then((files) =>
            res.send(files)
        );
    }
);

app.get("/client/holes", checkClientLogin, (req, res) => {
    if (!req.user || !req.user.client) {
        return res.send("Not authed as client");
    }
    Client.findById(req.user.client.id).then((client) => {
        client.getHoles().then((holes) => {
            res.send(holes);
        });
    });
});

app.get("/client/holes/:id", checkClientLogin, (req, res) => {
    if (!req.user || !req.user.client) {
        return res.send("Not authed as client");
    }
    Hole.findById(req.params.id).then((hole) => {
        if (hole.clientId !== req.user.client.id) {
            return res.status(401).send({ message: "Unauthorized" });
        }
        hole.getFiles().then((files) => {
            res.send(files);
        });
    });
});

app.get("/client/login", (req, res) => {
    res.render("client/index");
});

app.post("/client/login", authClient, (req, res) => {
    res.redirect("/client");
});

// Common Routes
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

const upload = require("./upload");

const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `uploads/${req.params.holeId}`);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const fileUplaod = multer({ storage: storage });

app.post(
    "/upload/:holeId/:file_name/:file_category/:file_size",
    upload.middleware,
    fileUplaod.single("file"),
    upload.singleFile
);

// app.post('/public/upload/:holeId/:file_size', upload.array("files"), checkAdminLogin, file_upload.middleware, file_upload.singleFile)
// app.post('/public/upload/zip', checkAdminLogin, upload.middleware, upload.zipFile)

// TODO: add checkClientLogin and authorization
// app.get('/download/:holeId/:file', checkClientLogin, checkClientOwnsHole, require('./download'))
// app.get('/admin/download/:holeId/:file', checkAdminLogin, require('./download'))

// Admin REST API
const clientResource = epilogue.resource({
    model: Client,
    endpoints: ["/api/clients", "/api/clients/:id"],
});

clientResource.all.auth(authEpilogue);

const holeResource = epilogue.resource({
    model: Hole,
    endpoints: ["/api/holes", "/api/holes/:id"],
});

holeResource.all.auth(authEpilogue);

const contactResource = epilogue.resource({
    model: Contact,
    endpoints: ["/api/contacts", "/api/contacts/:id"],
});

contactResource.all.auth(authEpilogue);

const fileResource = epilogue.resource({
    model: File,
    endpoints: ["/api/files", "/api/files/:id"],
});

fileResource.all.auth(authEpilogue);

// Start server
sequelize.sync({ force: false }).then(() => {
    app.listen(PORT);
    console.log(`Server listening at http://localhost:${PORT}`);
});
