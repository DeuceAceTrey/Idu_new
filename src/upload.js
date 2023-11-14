const AWS = require("aws-sdk");
const fs = require("fs");
const unzip = require("unzip");
const client = require("./s3-client");
const mime = require("mime");

const File = require("./models/File");
const sequelize = require("./connection");

const UPLOAD_DIRECTORY = "./uploads";

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

const singleFile = (req, res) => {
    const { holeId, file_name, file_category, file_size } = req.params;

    const segments = file_category.split(".");
    var file_type = segments[0] + "/" + segments[1];

    const file_url = getPath(holeId) + "/" + file_name;

    uploadFileToS3(
        holeId,
        file_url,
        file_name,
        file_type,
        file_size,
        (err, files) => {
            if (err) {
                return res.status(500).send("Could not upload to S3");
            }
            res.json("The file has been uploaded successfully.");
        }
    );
};

// WARNING: asssumes zip file always contains folder of same name, one level deep
const zipFile = function (req, res) {
    const { file } = req.files; // The name of the input field
    const { holeId } = req.body;
    const path = getPath(holeId);

    try {
        const filename = path + file.name;
        file.mv(filename, function (err) {
            if (err) {
                return res.status(500).send(err);
            }

            let unzipError = false;
            const stream = fs
                .createReadStream(filename)
                .pipe(unzip.Extract({ path }));

            stream.on("error", function (err) {
                unzipError = true;
                console.warn(err);
            });

            stream.on("close", function (args) {
                if (!unzipError) {
                    console.log("TODO: delete zip file (?)");
                }
                const directory = path + "/" + file.name.replace(".zip", "");
                uploadDirectoryToS3(holeId, directory, (err, files) => {
                    if (err) {
                        return res.status(500).send("Could not upload to S3");
                    }
                    res.send(files);
                });
            });
        });
    } catch (err) {
        console.warn(err);
        return res.status(500).send("Unknown Issue");
    }
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
        // const directory = getPath(holeId).slice(2)
        // persistToDatabase(holeId, [baseFilename], directory)
        done(null, [file_url]);
        console.log("The file has been uploaded to S3 Bucket successfully.");

        sequelize
            .authenticate()
            .then(() => {
                console.log("Connection has been established successfully.");
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
    });
    uploader.on("progress", () => {
        // res.send({"state": uploader.progressAmount, "total": uploader.progressTotal})
    });
};

const uploadDirectoryToS3 = (holeId, path, done) => {
    const directory = path.split("/").pop();
    const paths = fs.readdirSync(path);
    const uploader = client.uploadDir({
        localDir: path,
        deleteRemoved: true, // default false, whether to remove s3 objects that have no corresponding local file.
        s3Params: {
            Bucket: "ldu-test",
            Prefix: "uploads/" + holeId + "/" + directory,
        },
    });
    uploader.on("error", (err) => {
        console.error("Could not upload to S3", err.stack);
        done(err);
    });
    uploader.on("end", () => {
        persistToDatabase(holeId, paths, path.slice(2)); // strip ./ from start of directory
        done(null, paths);
    });
    uploader.on("progress", () => {
        // console.log('progress', uploader.progressAmount, uploader.progressTotal)
    });
};

module.exports = { middleware, singleFile };
