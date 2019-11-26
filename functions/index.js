const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.addAdminRole = functions.https.onCall((data, context) => {

    return admin.auth().getUserByEmail(data.email).then(user=> {
        return admin.auth().setCustomUserClaims(user.uid,{
            admin:true
        });
    }).then(()=>{
        return{
            message: 'success! ' + data.email  + ' has been made an admin'
        }
    }).catch(err =>{
        return err;
    })


})

exports.deleteUser = functions.https.onCall((data, context) => {
    return admin.auth().deleteUser(data.uid)
    .then(function() {
        return{
            message: 'success! ' + data.uid  + ' has been made an Deleted'
        }
    })
    .catch(function(error) {
        return console.log('Error deleting user:', error);
    });


})