document.addEventListener('DOMContentLoaded', function () {



    
    firebase.auth().onAuthStateChanged(user => {
        var x = document.getElementById("signOut_btn");
        var y = document.getElementById("name_test");
        if(user){
            x.style.display = "block";
            y.innerHTML = "User ID: " + user.uid + "   ";

            user.getIdTokenResult().then(IdTokenResult => {
                user.admin = IdTokenResult.claims.admin;
                setViability(user, y);
            });

        }else{
            x.style.display = "none";
            y.innerHTML = ""
            window.location.href = 'login.html';
        }

    });

    function setViability(user, y) {
        //const adminUi = document.querySelectorAll('.admin');
        if (user.admin) {
            y.innerHTML += "    Admin ";
            //adminUi.forEach(items => items.style.display = 'block');
        }
    }

    const signOut = function (ev) {

        ev.preventDefault();
        ev.stopPropagation();
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
          }).catch(function(error) {
            // An error happened.
          });
    }

    
    document.getElementById('signOut_btn').addEventListener('click', signOut);



});

