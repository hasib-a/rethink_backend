document.addEventListener('DOMContentLoaded', function () {
    //Start the necessary apis. 
    const db = firebase.firestore();
    const functions = firebase.functions();


    //check if the user is logged on
    firebase.auth().onAuthStateChanged(user => {
        var x = document.getElementById("signOut_btn");
        var y = document.getElementById("name_test");
        if (user) {
            x.style.display = "block";
            y.innerHTML = "User ID: " + user.uid + "   ";

            user.getIdTokenResult().then(IdTokenResult => {
                user.admin = IdTokenResult.claims.admin;
                setViability(user, y);
            });
        } else {
            x.style.display = "none";
            y.innerHTML = ""
            window.location.href = 'login.html';
        }
        console.log(user);
    });

    //Hides elemnts depending on admin status
    function setViability(user, y) {
        const adminUi = document.querySelectorAll('.admin');
        console.log(adminUi)
        if (user.admin) {
            y.innerHTML += "    Admin ";
            adminUi.forEach(items => items.style.display = 'block');
        }
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

    const clear = function (ev) {
        ev.preventDefault();
        document.getElementById('fromLogin').reset();
    }
    const send = function (ev) {
   
    }


    //Button references 
    document.getElementById('clr_btn').addEventListener('click', clear);
    document.getElementById('sub_btn').addEventListener('click', send);
    document.getElementById('signOut_btn').addEventListener('click', signOut);


    $("ul").on("click", "button", function(e) {
        e.preventDefault();
        console.log($(this).parent())
        console.log($(this).parent().attr('value'))
        $(this).parent().remove();
        
    });
});