document.addEventListener('DOMContentLoaded', function () {

    //check the users logged in status
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
        if (user.admin) {
            y.innerHTML += "    Admin ";
        }
    }

    const signOut = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        firebase.auth().signOut().then(function() {
          }).catch(function(error) {
          });
    }

    document.getElementById('signOut_btn').addEventListener('click', signOut);



});

