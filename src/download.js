const AWS = require("aws-sdk");
// const s3 = new AWS.S3();
// const S3Config = require("./aws-config");
// AWS.config.update(S3Config);
const client = require("./s3-client");
const fs = require("fs");

const File = require("./models/File");

const DOWNLOAD_DIRECTORY = "./public/downloads";

var progressPercentage = 0;

if (!fs.existsSync(DOWNLOAD_DIRECTORY)) {
    fs.mkdirSync(DOWNLOAD_DIRECTORY);
}

const getPath = (holeId) => DOWNLOAD_DIRECTORY + "/" + holeId;

const middleware = (req, res, next) => {
    const { holeId, name } = req.body;
    const path = DOWNLOAD_DIRECTORY + "/" + holeId;

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }

    next();
};

const downloadFile = (req, res) => {
    const { holeId, name } = req.body;

    File.find({ where: { holeId, name } }).then((file) => {
        if (!file) {
            return res.status(404).send({ message: "Not found in database" });
        }
        if (req.user.client) {
            file.viewed = true;
            file.save();
        }

        const file_url = getPath(holeId) + "/" + name;

        res.send("Download Start");
        console.log("Download Start");

        downloadFileFromS3(holeId, name, file_url, (err) => {
            if (err) {
                return res.status(500).send("Could not upload to S3");
            }
        });
    });
};

const sendProgress = (req, res) => {
    res.json(progressPercentage);
    console.log("Current Precent:", progressPercentage + "%");
};

const downloadFileFromS3 = (holeId, name, file_url) => {
    const Key = "uploads/" + holeId + "/" + name;

    const params = {
        localFile: file_url,
        s3Params: {
            Bucket: "ldu-test",
            Key,
        },
    };

    const downloader = client.downloadFile(params);

    downloader.on("error", (err) => {
        console.error("Could not upload to S3", err.stack);
    });

    downloader.on("end", () => {
        setTimeout(function () {
            progressPercentage = 0;
            console.log(
                "The file has been downloaded from S3 Bucket successfully."
            );
        }, 1000);
    });
    downloader.on("progress", () => {
        progressPercentage = Math.round(
            (downloader.progressAmount / downloader.progressTotal) * 100
        );
    });

    // s3.getObject(options, function (err, data) {
    //     if (err === null) {
    //         console.log("Successfully downloaded from S3 Bucket.");

    //         fs.writeFile(
    //             `${DOWNLOAD_DIRECTORY}/${holeId}/${name}`,
    //             data.Body,
    //             function (err) {
    //                 if (err) {
    //                     console.log(err);
    //                 } else {
    //                     res.send("/downloads/" + holeId + "/" + name);
    //                     console.log("Successfully downloaded to Client.");
    //                 }
    //             }
    //         );
    //     } else {
    //         //    res.status(500).send(err);
    //         console.log("download_error", err);
    //     }
    // });
};

module.exports = { middleware, downloadFile, sendProgress };
