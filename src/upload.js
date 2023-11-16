const AWS = require("aws-sdk");
const client = require("./s3-client");
const fs = require("fs");

const File = require("./models/File");
const sequelize = require("./connection");

const UPLOAD_DIRECTORY = "./uploads";

var progressPercentage = 0;

if (!fs.existsSync(UPLOAD_DIRECTORY)) {
    fs.mkdirSync(UPLOAD_DIRECTORY);
}
const getPath = (holeId) => UPLOAD_DIRECTORY + "/" + holeId;

const middleware = (req, res, next) => {
    const { holeId } = req.params;
    const path = UPLOAD_DIRECTORY + "/" + holeId;

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }

    next();
};

const uploadFile = (req, res) => {
    const { holeId, file_name, file_category, file_size } = req.params;

    const segments = file_category.split(".");
    var file_type = segments[0] + "/" + segments[1];

    const file_url = getPath(holeId) + "/" + file_name;

    res.json("Upload Start");
    console.log("Upload Start");

    uploadFileToS3(
        holeId,
        file_url,
        file_name,
        file_type,
        file_size,
        (err, data) => {
            if (err) {
                return res.status(500).send("Could not upload to S3");
            }
        }
    );
};

const sendProgress = (req, res) => {
    res.json(progressPercentage);
    console.log("Current Precent:", progressPercentage + "%");
};

const uploadFileToS3 = (
    holeId,
    file_url,
    file_name,
    file_type,
    file_size,
    done
) => {
    const Key = "uploads/" + holeId + "/" + file_name;

    const params = {
        localFile: file_url,
        s3Params: {
            Bucket: "ldu-test",
            Key,
        },
    };

    const uploader = client.uploadFile(params);

    uploader.on("error", (err) => {
        console.error("Could not upload to S3", err.stack);
        done(err);
    });

    uploader.on("end", () => {
        setTimeout(function () {
            done(null, [file_url]);
            progressPercentage = 0;
            console.log(
                "The file has been uploaded to S3 Bucket successfully."
            );

            sequelize
                .authenticate()
                .then(() => {
                    console.log(
                        "Connection has been established successfully."
                    );
                })
                .catch((error) => {
                    console.error("Unable to connect to the database: ", error);
                });

            sequelize
                .sync()
                .then(() => {
                    File.create({
                        name: file_name,
                        url: file_url,
                        size: file_size,
                        type: file_type,
                        viewed: false,
                        holeId: holeId,
                    })
                        .then((res) => {
                            console.log("Successfully saved to Database.");
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                })
                .catch((err) => {
                    console.log(err);
                });
        }, 1000);
    });
    uploader.on("progress", () => {
        progressPercentage = Math.round(
            (uploader.progressAmount / uploader.progressTotal) * 100
        );
    });
};

module.exports = { middleware, uploadFile, sendProgress };
