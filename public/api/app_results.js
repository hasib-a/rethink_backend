document.addEventListener('DOMContentLoaded', function () {
    var url = document.location.href,
        params = url.split('?')[1].split('&'),
        data = {}, tmp;
    for (var i = 0, l = params.length; i < l; i++) {
        tmp = params[i].split('=');
        data[tmp[0]] = tmp[1];
    }
    boardID = data.var1
    pollID = data.var2
    var pollName = data.var3;
    pollName = pollName.replace(/%20/g, " ");
    //Start the necessary apis. 
    const db = firebase.firestore();
    const functions = firebase.functions();
    const pollDB = db.collection("boardroom").doc(boardID).collection("polls").doc(pollID);

    document.querySelector('#pg_ttl').innerHTML = "Poll Name: " + pollName + "<br>  Poll ID - " + pollID;
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
    });

    //Hides elemnts depending on admin status
    function setViability(user, y) {
        const adminUi = document.querySelectorAll('.admin');
        if (user.admin) {
            y.innerHTML += "    Admin ";
            adminUi.forEach(items => items.style.display = 'block');
        }
    }

    pollDB.collection("pollOptions").onSnapshot(doc => {
        let htmlList = "";
        doc.forEach(function (doc) {
            htmlList +="<li class=\"list-group-item\"><h4>Poll Option: "+doc.data().pollDesc+"</h4><h5>Amount of votes: "+doc.data().voteCount+"</h5></li>";
           
        });
        document.querySelector('#VoteList').innerHTML = htmlList;
    });


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


    //Button references 
    document.getElementById('signOut_btn').addEventListener('click', signOut);

});