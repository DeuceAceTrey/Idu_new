const _ = require("lodash");

const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const Admin = require("./models/Admin");
const Client = require("./models/Client");
const Contact = require("./models/Contact");

// WARNING: HACK: Only works if admins don't have email
const isAdmin = (d) => !d.email;

passport.use(
    "user-local",
    new LocalStrategy((username, password, done) => {
        return Admin.findOne({ where: { username } }).then((admin) => {
            if (!admin) {
                return done(null, false);
            }
            const hash = bcrypt.hashSync(password, admin.salt);
            if (admin.password !== hash) {
                return done(null, false);
            }
            return done(null, admin.toJSON());
        });
    })
);

passport.use(
    "client-local",
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
        return Contact.findOne({ where: { email } }).then((contact) => {
            if (!contact) {
                return done(null, false);
            }
            const hash = bcrypt.hashSync(password, contact.salt);
            if (contact.password !== hash) {
                console.log("bad password");
                return done(null, false);
            }
            contact.lastLoggedIn = new Date();
            contact.save();
            console.log(
                "authed as contact:",
                contact.name,
                "at",
                contact.lastLoggedIn
            );
            return done(null, contact.toJSON());
        });
    })
);

passport.serializeUser((entity, done) => {
    const type = isAdmin(entity) ? "admin" : "client";
    return done(null, {
        id: entity.id,
        type,
    });
});

passport.deserializeUser((key, done) => {
    const { id, type } = key;
    if (type === "admin") {
        Admin.findById(id).then((admin) => {
            done(null, { admin });
        });
    } else {
        Contact.findById(id).then((contact) => {
            done(null, { contact });
            // const { clientId } = contact
            // Client.findOne({ where: { clientId } }).then(client => {
            //     console.log('Authed Contact found Client:', client.name)
            //     done(null, { contact, client })
            // })
        });
    }
});

const authAdmin = passport.authenticate("user-local", {
    failureRedirect: "/admin/login",
});

const authClient = passport.authenticate("client-local", {
    failureRedirect: "/client/login",
});

const checkAdminLogin = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user.admin) {
        return res.redirect("/admin/login");
    }
    next();
};

const checkClientLogin = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user.contact) {
        return res.redirect("/client/login");
    }
    next();
};

const checkClientOwnsHole = (req, res, next) => {
    const { holeId } = req.params;
    Contact.findById(req.user.contact.id).then((contact) => {
        contact.getClients().then((clients) => {
            Promise.all(clients.map((client) => client.getHoles())).then(
                (holesArray) => {
                    const holes = _.flatten(holesArray);
                    const holeIds = holes.map((hole) => parseInt(hole.id));
                    if (holeIds.indexOf(parseInt(holeId)) === -1) {
                        return res
                            .status(401)
                            .send({ message: "Unauthorized" });
                    }
                    next();
                }
            );
        });
    });
};

const authEpilogue = (req, res, context) => {
    return new Promise((resolve, reject) => {
        if (!req.isAuthenticated || !req.isAuthenticated() || !req.user.admin) {
            res.status(401).send({ message: "Unauthorized" });
            resolve(context.stop);
        } else {
            resolve(context.continue);
        }
    });
};

module.exports = {
    authAdmin,
    authClient,
    checkAdminLogin,
    checkClientLogin,
    checkClientOwnsHole,
    authEpilogue,
};
