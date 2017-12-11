const cloudinary = require('cloudinary');
const firebase = require('firebase');

const config = {
  apiKey: "<FIREBASE_API_KEY>",
  authDomain: "<FIREBASE_AUTH_DOMAIN>",
  databaseURL: "<FIREBASE_DATABASE_URL>",
  projectId: "<FIREBASE_PROJECT_ID>",
  storageBucket: "<FIREBASE_STORAGE_BUCKET>",
  messagingSenderId: "<FIREBASE_SENDER_ID>"
};

firebase.initializeApp(config);

cloudinary.config({
  cloud_name: '<YOUR-CLOUD-NAME>',
  api_key: '<YOUR-API-KEY>',
  api_secret: '<YOUR-API-SECRET>'
});

// Get a reference to the database service
let database = firebase.database().ref('cloudinary_logs');

exports.uploadImageMeta = function (req, res){
  let file = req.body.file;
  let fileName = req.body.filename;

	uploadToCloudinary(file, fileName).then((uploadResult) => {
    return pushMetadataToFirebase(uploadResult, fileName);
  }).then((response) => {
    res.send({
			"message" : `Image file ${fileName} uploaded to Cloudinary and metadata pushed to Firebase`,
			"cloudinary_data" : response
		});
  }).catch((err) => {
    throw err;
  })
}

let uploadToCloudinary = (file, fileName) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(file)
    .then((result) => {
      console.log(`Image file ${fileName} successfully uploaded`);
      resolve(result);
    }).catch((err) => {
      console.error(`Error in uploading image ${fileName} - ${err}`);
      reject(err)
    });
  })
}

let pushMetadataToFirebase = (data, fileName) => {
	return new Promise((resolve, reject) => {
		database.push(data)
		.then(() => {
			console.log(`Metadata of file ${fileName} pushed to Firebase`);
      resolve(data);
		}).catch((err) => {
      console.error(`Error in pushing metadata of file ${fileName} to Firebase - ${err}`);
      reject(err);
    });
	})
}