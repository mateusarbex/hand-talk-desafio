import "dotenv/config";
export default {
  name: "DesafioHand",
  version: "1.0.0",
  android: {
    package: "com.desafiohand.mobile",
  },
  extra: {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
    storageBucket: process.env.projectId,
    appId: process.env.appId,
  },
};
