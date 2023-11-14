const AWS = require("aws-sdk");
const S3Config = require("./aws-config");
AWS.config.update(S3Config);
const s3 = new AWS.S3();
const fs = require("fs");

const File = require("./models/File");

const DOWNLOAD_DIRECTORY = "./public/downloads";

if (!fs.existsSync(DOWNLOAD_DIRECTORY)) {
    fs.mkdirSync(DOWNLOAD_DIRECTORY);
}

const middleware = (req, res, next) => {
    const { holeId, name } = req.body;
    const path = DOWNLOAD_DIRECTORY + "/" + holeId;

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }

    next();
};

const fileDownload = (req, res) => {
    const { holeId, name } = req.body;

    File.find({ where: { holeId, name } }).then((file) => {
        if (!file) {
            return res.status(404).send({ message: "Not found in database" });
        }
        if (req.user.client) {
            file.viewed = true;
            file.save();
        }

        const Key = "uploads/" + holeId + "/" + name;

        const options = {
            Bucket: "ldu-test",
            Key,
        };

        s3.getObject(options, function (err, data) {
            if (err === null) {
                console.log("Successfully downloaded from S3 Bucket.");

                fs.writeFile(
                    `${DOWNLOAD_DIRECTORY}/${holeId}/${name}`,
                    data.Body,
                    function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send("/downloads/" + holeId + "/" + name);
                            console.log("Successfully downloaded to Client.");
                        }
                    }
                );
            } else {
                //    res.status(500).send(err);
                console.log("download_error", err);
            }
        });
    });
};

module.exports = { middleware, fileDownload };
