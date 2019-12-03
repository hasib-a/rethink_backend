document.addEventListener('DOMContentLoaded', function () {
    var url = document.location.href,
        params = url.split('?')[1].split('&'),
        data = {}, tmp;
    for (var i = 0, l = params.length; i < l; i++) {
        tmp = params[i].split('=');
        data[tmp[0]] = tmp[1];
    }
    var boardID = data.var1;
    var pollID = data.var2;
    var pollName = data.var3;
    pollName = pollName.replace(/%20/g, " ");
    //Start the necessary apis. 
    const db = firebase.firestore();
    const functions = firebase.functions();
    const pollDB = db.collection("boardroom").doc(boardID).collection("polls").doc(pollID);
    const userDB = db.collection("users");
    var userUID = "";

    document.querySelector('#pg_ttl').innerHTML = "Poll Name: " + pollName + "<br>  Poll ID - " + pollID + "  ";

    //check if the user is logged on
    firebase.auth().onAuthStateChanged(user => {
        var x = document.getElementById("signOut_btn");
        var y = document.getElementById("name_test");
        
            if (user) {
                pollDB.get().then(function(doc){
                let userArray = doc.data().votedUser; 
                if(userArray.includes(user.uid)){
                    window.location.href = 'results.html?var1='+ boardID + "&var2=" + pollID + "&var3=" + pollName;
                }else{
                    x.style.display = "block";
                    y.innerHTML = "User ID: " + user.uid + "   ";
                    userUID = user.uid;
                    user.getIdTokenResult().then(IdTokenResult => {
                        user.admin = IdTokenResult.claims.admin;
                        setViability(user, y, doc.data().endTime);
                    });
                }
            });
            } else {
                x.style.display = "none";
                y.innerHTML = ""
                window.location.href = 'login.html';
            }
        
        
    });

    //Hides elemnts depending on admin status
    function setViability(user, y,endTime) {
        const adminUi = document.querySelectorAll('.admin');
        let disableOptions = document.querySelectorAll('.disabled');
        var currentDate = new Date();
        if(endTime.toDate() <= currentDate){
            disableOptions.forEach(items => items.style.display = 'none')
        }else{
            disableOptions.forEach(items => items.style.display = 'block')
        }
       
        if (user.admin) {
            y.innerHTML += "    Admin ";
            adminUi.forEach(items => items.style.display = 'block');
            createLists(user.admin, endTime, currentDate)
        }else{
            createLists(false, endTime, currentDate)
        }
    }



    function createLists(adminCheck, endTime, currentDate){
    pollDB.collection("comments").onSnapshot(doc => {
        let htmlComment = "";
        doc.forEach(function (doc) {
            let date = timeConverter(doc.data().time.seconds)
            htmlComment += "<li class=\"list-group-item comments\" value=\"" + doc.id + "\"><h6 class=\"d-inline\" >Username: " + doc.data().userName + " </h6><h6 class=\"d-inline\">User ID: " + doc.data().userID + " </h6><div class=\"card card-body \"><p>" + doc.data().comment + "</p></div><h6>Time: " + date + "  </h6><button style=\"display: none;\" class=\"adminDisabled\">delete</button></li>";
        });
        document.querySelector('#pg_cmnt').innerHTML = htmlComment;
            if(adminCheck){
            let adminDisableOptions = document.querySelectorAll('.adminDisabled');
            adminDisableOptions.forEach(items => items.style.display = 'block');
            }
    })

    pollDB.collection("pollOptions").onSnapshot(doc => {
        let htmlComment = "";
        let i = 1;
        doc.forEach(function (doc) {

            htmlComment += "<li class=\"list-group-item\" value=\"" + doc.id + "\"><h6>Option: " + i + " </h6><div class=\"card card-body \"><p>" + doc.data().pollDesc + "</p></div><h6>Option ID: " + doc.id + " </h6><button class=\"delete adminDisabled\" style=\"display: none;\">delete</button><button class=\"vote\">vote</button></li>";
            i++;
        });
        document.querySelector('#pg_quest').innerHTML = htmlComment;
        if(endTime.toDate() >= currentDate){
            if(adminCheck){
                let adminDisableOptions = document.querySelectorAll('.adminDisabled');
                adminDisableOptions.forEach(items => items.style.display = 'inline');
                }
        }
        
        
    });
    }

    //sign the user out of auth
    const signOut = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        firebase.auth().signOut().then(function () {
            // Sign-out successful.
        }).catch(function (error) {
            console.log(error)
            // An error happened.
        });
    }

    const send_quest = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var questionIn = document.forms.questAdd.elements.question.value;

        //XSS filter
        questionIn = filterXSS(questionIn);

        if (questionIn == "") {
            console.log("Fail");
        } else {
            pollDB.collection("pollOptions").doc().set({ pollDesc: questionIn, voteCount: 0 })
        }
        document.getElementById('questAdd').reset();
    }
    const send_cmnt = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var commentIn = document.forms.commentAdd.elements.comment.value;
        var currentTime = firebase.firestore.Timestamp.fromDate(new Date());

        //XSS filter
        commentIn = filterXSS(commentIn);

        if (commentIn == "") {
            console.log("Fail");
        } else {
            firebase.auth().currentUser.getIdTokenResult().then(IdTokenResult => {
                userID = IdTokenResult.claims.user_id;
                userDB.doc(userID).get().then(function (doc) {
                    pollDB.collection("comments").doc().set({ comment: commentIn, userID: userID, userName: doc.data().userName, time: currentTime })
                });

            });

        }
        document.getElementById('questAdd').reset();
    }




    //Button references 
    document.getElementById('sub_btn_quest').addEventListener('click', send_quest);
    document.getElementById('sub_btn_cmnt').addEventListener('click', send_cmnt);
    document.getElementById('signOut_btn').addEventListener('click', signOut);

    function timeConverter(UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
        return time;
    }

    $('#pg_cmnt').on("click", "button", function (e) {
        e.preventDefault();

        ID = $(this).parent().attr('value');
        $(this).parent().remove();
        pollDB.collection("comments").doc(ID).delete().then(function () {
            console.log("Document successfully deleted!");
        }).catch(function (error) {
            console.error("Error removing document: ", error);
        });
    });

    $('#pg_quest').on("click", "button.vote", function (e) {
        e.preventDefault();
        console.log("vote")
        ID = $(this).parent().attr('value');
        var voteRef = pollDB.collection("pollOptions").doc(ID );
        voteRef.update({
            voteCount: firebase.firestore.FieldValue.increment(1)
        });
        pollDB.update({
            votedUser: firebase.firestore.FieldValue.arrayUnion(userUID)
        }).then(function(){
            window.location.href = 'results.html?var1='+boardID+ "&var2=" + pollID + "&var3=" + pollName;
        })
        
    });
    $('#pg_quest').on("click", "button.delete", function (e) {
        e.preventDefault();
        console.log("delete")
        ID = $(this).parent().attr('value');
        $(this).parent().remove();
        pollDB.collection("pollOptions").doc(ID).delete().then(function() {
            console.log("Document successfully deleted!");
        }).catch(function(error) {
            console.error("Error removing document: ", error);
        });
    });


});