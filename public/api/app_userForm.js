document.addEventListener('DOMContentLoaded', function () {
    //Start the necessary apis. 
    const db = firebase.firestore();
    const usersDB = db.collection("users");
    const functions = firebase.functions();


    //Start the second user auth connection
    var config = {
        apiKey: "AIzaSyALKt7vM-dUYAx7MQFCLPWaDGzv7-XHikc",
        authDomain: "rethink-16f07.firebaseapp.com",
        databaseURL: "https://rethink-16f07.firebaseio.com"
    };
    var secondaryApp = firebase.initializeApp(config, "Secondary");
    var alert = document.getElementById("signInAlert");

    //check if the user is logged on
    firebase.auth().onAuthStateChanged(user => {
        var x = document.getElementById("signOut_btn");
        var y = document.getElementById("userName");
        if (user) {
            x.style.display = "block";
            y.innerHTML = "User ID: " + user.uid + "   ";
            user.getIdTokenResult().then(IdTokenResult => {
                user.admin = IdTokenResult.claims.admin;
                setListViability(user);
                setViability(user, y);

            });
        } else {
            x.style.display = "none";
            y.innerHTML = ""
            window.location.href = 'login.html';
        }

    });

    //Hides delete option from list depedning on admin status
    function setListViability(user) {
        db.collection("users").onSnapshot((doc) => {
            let htmlOut = "";
            if (user.admin) {
                doc.forEach(function (doc) {
                    htmlOut += "<li class=\"list-group-item\" value=\"" + doc.id + "\"> <h6>User ID: " + doc.id + " </h6><br> <h6>Username: " + doc.data().userName + "</h6><br><h6>Type: " + doc.data().userType + "</h6> <button>delete</button></li>"
                });
            } else {
                doc.forEach(function (doc) {
                    htmlOut += "<li class=\"list-group-item\"> <h6>User ID: " + doc.id + " </h6><br> <h6>Username: " + doc.data().userName + "</h6><br><h6>Type: " + doc.data().userType + "</h6></li>"
                });
            }
            document.getElementById('userListPrint').innerHTML = htmlOut;
        });
    }

    //Hides elemnts depending on admin status
    function setViability(user, y) {
        const adminUi = document.querySelectorAll('.admin');
        if (user.admin) {
            y.innerHTML += "    Admin ";
            adminUi.forEach(items => items.style.display = 'block');
        }


    }


    //Clear the form
    const clear = function (ev) {
        ev.preventDefault();
        document.getElementById('userCreate').reset();
    }

    //Create the new user
    const signUp = function (ev) {
        let adminCheck = "";
        firebase.auth().currentUser.getIdTokenResult().then(IdTokenResult => {
            adminCheck = IdTokenResult.claims.admin;
            if (adminCheck == true) {
                ev.preventDefault();
                ev.stopPropagation();
                let email = document.forms.userCreate.elements.email.value;
                let password = document.forms.userCreate.elements.password.value;
                let userName = document.forms.userCreate.elements.userName.value;
                let userType = document.forms.userCreate.elements.userType.value;

                if (email == "" || password == "" || userName == "") {
                    alert.style.display = "block";
                } else {
                    secondaryApp.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
                        // Handle Errors here.
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        console.log("ERROR", errorCode)
                        console.log(error.message)
                    }).then(newUser => {
                        console.log(newUser.user)
                        console.log("User " + newUser.user.uid + " created successfully!");

                        if (userType == "Chairman") {
                            const addAdminRole = functions.httpsCallable('addAdminRole')
                            addAdminRole({ email: email }).then(result => {
                                console.log(result);
                            });
                        };

                        var userData = {
                            userName: userName,
                            userType: userType
                        };
                        usersDB.doc(newUser.user.uid).set(userData);

                    });
                };

            } else {
                console.log("This feature is only for admins")
            };
            document.getElementById('userCreate').reset();
        });

    }


    //sign the user out of auth
    const signOut = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        firebase.auth().signOut().then(function () {
            // Sign-out successful.
        }).catch(function (error) {
            // An error happened.
        });
    }

    //Button Refrences
    document.getElementById('clr_btn').addEventListener('click', clear);
    document.getElementById('signUp_btn').addEventListener('click', signUp);
    document.getElementById('signOut_btn').addEventListener('click', signOut);
    document.getElementsByClassName("close")[0].onclick = function () {
        alert.style.display = "none";
    }


    $("ul").on("click", "button", function (e) {
        e.preventDefault();
        console.log($(this).parent());
        var ID = $(this).parent().attr('value');

        firebase.auth().currentUser.getIdTokenResult().then(IdTokenResult => {
            let adminCheck = IdTokenResult.claims.admin;
            if (adminCheck == true) {
                const adminDeleteUser = functions.httpsCallable('deleteUser')
                adminDeleteUser({ uid: ID }).then(result => {
                    console.log(result);
                });
                usersDB.doc(ID).delete().then(function () {
                    console.log("User document successfully deleted!");
                }).catch(function (error) {
                    console.error("Error removing document: ", error);
                });
            } else {
                console.log("This feature is only for admins")
            }
        });

        $(this).parent().remove();

    });


});

