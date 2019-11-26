document.addEventListener('DOMContentLoaded', function () {

    var alert = document.getElementById("signInAlert");

    
    firebase.auth().onAuthStateChanged(user => {
        var x = document.getElementById("signOut_btn");
        var z = document.getElementById("fromLogin");
        if(user){
            x.style.display = "block";
            z.style.display = "none";
            window.location.href = 'index.html';
        }else{
            x.style.display = "none";
            z.style.display = "block";
        }

    });
    // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
    const clear = function (ev) {
        ev.preventDefault();
        document.getElementById('fromLogin').reset();
    }
    const signIn = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        let email = document.forms.fromLogin.elements.email.value;    
        let password = document.forms.fromLogin.elements.password.value;
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode,errorMessage);
            alert.style.display = "block";
            // ...
          });
          document.getElementById('fromLogin').reset();
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

    document.getElementsByClassName("close")[0].onclick = function() {
        alert.style.display = "none";
      }


    document.getElementById('clr_btn').addEventListener('click', clear);
    document.getElementById('signIn_btn').addEventListener('click', signIn);
    document.getElementById('signOut_btn').addEventListener('click', signOut);



});

