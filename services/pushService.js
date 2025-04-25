// const admin = require("firebase-admin")
// const serviceAccount = require("../firebase-adminsdk.json")

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// })

// const PushService = {
//   sendNotification: async (token, title, body) => {
//     return admin.messaging().send({
//       token,
//       notification: { title, body }
//     })
//   }
// }

// module.exports = PushService