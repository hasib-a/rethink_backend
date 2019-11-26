document.addEventListener('DOMContentLoaded', function () {
    //Read the HTML data
    var queryString = decodeURIComponent(window.location.search);
    queryString = queryString.substring(1);
    var queries = queryString.split("=");
    var idFinal = queries[1];
    document.querySelector('#pg_ttl').innerHTML = "Boardroom ID - " + idFinal + "  ";




    //Start the necessary apis. 
    const db = firebase.firestore();
    const functions = firebase.functions();
    const boardroomDB = db.collection("boardroom").doc(idFinal);
    const userDB = db.collection("users");
    const patientDB = db.collection("patient");



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

    //get data for main header+info
    boardroomDB.onSnapshot(doc => {
        const data = doc.data();
        var boardChair = data.boardChair;
        boardName = data.boardName;
        getUser(boardChair, boardName);
    });

    //create html for main header+info
    function getUser(boardChair, boardName) {
        userDB.doc(boardChair).onSnapshot(doc => {
            const dataNew = doc.data();
            boardUsername = dataNew.userName;
            var htmlHeadingOut = "Boardroom Name: " + boardName + "</h5> <h5>Boardroom Chairman: " + boardUsername;
            document.querySelector('#pg_content').innerHTML = htmlHeadingOut;
        });
    };

    function createListMembers(adminCheck){
    boardroomDB.onSnapshot(doc => {
        let members = doc.data().members;
        console.log();
        let moderators = doc.data().moderators;
        console.log();
        let adminCheckValue = "none";
        if(adminCheck){
            adminCheckValue = "inline"
        }
        members.forEach(function (user) {
            let htmlOutMembers = "";
            document.querySelector('#memberPrint').innerHTML = "";
            listMembers(user, htmlOutMembers, adminCheckValue)
        });
        moderators.forEach(function (user) {
            let htmlOutmods = "";
            document.querySelector('#moderatorPrint').innerHTML = "";
            listModerators(user, htmlOutmods, adminCheckValue)
        });
    });
    }

    function listMembers(id, htmlOutMembers, adminCheckValue) {
        userDB.doc(id).onSnapshot(doc => {
            htmlOutMembers = "<li class=\"list-group-item\" value=\"" + id + "\"><h6>User ID: " + doc.id + "</h6><h6>Username: " + doc.data().userName + "</h6> <button style=\"display: "+ adminCheckValue +";\">delete</button></li>"
            console.log();
            document.querySelector('#memberPrint').innerHTML += htmlOutMembers;
        });
    }

    function listModerators(id, htmlOutmods, adminCheckValue) {
        userDB.doc(id).onSnapshot(doc => {
            htmlOutmods = "<li class=\"list-group-item\" value=\"" + id + "\"><h6>User ID: " + doc.id + "</h6><h6>Username: " + doc.data().userName + "</h6> <button style=\"display: "+ adminCheckValue +";\">delete</button></li>"

            document.querySelector('#moderatorPrint').innerHTML += htmlOutmods;
        });
    }




    //Fill the member List with avaiable members 
    userDB.onSnapshot(doc => {
        let htmlOutUsers = "<option Selected></option>";
        doc.forEach(function (doc) {
            htmlOutUsers += "<option>" + doc.id + " =>  " + doc.data().userName + "</option>";
        });
        document.querySelector('#memberList').innerHTML += htmlOutUsers;
    });



    //Hides elemnts depending on admin status
    function setViability(user, y) {
        const adminUi = document.querySelectorAll('.admin');
        if (user.admin) {
            y.innerHTML += "    Admin ";
            adminUi.forEach(items => items.style.display = 'block');
            createListMembers(user.admin)
            createListBoards(user.admin)
        }else{
            createListMembers(false)
            createListBoards(false)
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

    patientDB.get().then(function (querySnapshot) {
        var htmlOutUsers = "<option Selected></option>";
        querySnapshot.forEach(function (doc) {
            htmlOutUsers += "<option>" + doc.id + " =>  "+ doc.data().pntName+  "</option>";
        });
        document.querySelector('#patientList').innerHTML += htmlOutUsers;
    }); 
    function createListBoards(adminCheck){
        boardroomDB.collection("polls").onSnapshot(doc =>{
            let adminCheckValue = "none";
            if(adminCheck){
            adminCheckValue = "inline"
            }
            let htmlOutPoll = "";
            doc.forEach(function (doc){
                var startDate = timeConverter(doc.data().startTime.seconds);
                var endDate = timeConverter(doc.data().endTime.seconds);
                    //doc = list of docs in polls 
                    htmlOutPoll += "<li class=\"list-group-item\" value=\"" + idFinal +" "+doc.id + "\"><div class=\"d-flex flex-row bd-highlight mb-3\"><div class=\"p-2 bd-highlight\"><h6>Poll ID: " + doc.id + "</h6></div>"
                    htmlOutPoll += "<div class=\"p-2 bd-highlight\"><h6>Poll Name: " + doc.data().pollName + "</h6></div></div>"
                    htmlOutPoll += "<div class=\"d-flex flex-row bd-highlight mb-3\"><div class=\"p-2 bd-highlight\"><h6>Start Date: " + startDate + " </h6></div><div class=\"p-2 bd-highlight\"><h6>End Date: " + endDate + "</h6></div></div>"
                    htmlOutPoll += "<div class=\"p-2 bd-highlight\"><h6>Patient Name: " + doc.data().patient + " </h6></div><a href=\"pollPage.html?var1=" + idFinal + "&var2=" + doc.id + "\"><input type=\"button\" value=\"Enter Poll\"></a><button style=\"display: "+ adminCheckValue +";\">delete</button></li>"
               
            });
            document.querySelector('#pollPrint').innerHTML = htmlOutPoll;
    
        });
    }
    
    
         



    //Add a user to a board
    const send = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        let adminCheck = "";
        firebase.auth().currentUser.getIdTokenResult().then(IdTokenResult => {
            adminCheck = IdTokenResult.claims.admin;
            if (adminCheck == true) {
                let userID = document.forms.memberForm.elements.memberList.value;
                let modStatus = document.forms.memberForm.elements.moderator.value;
                userID = userID.split(' ')
                
                userDB.doc(userID[0]).collection("activeBoards").doc(idFinal).set({});
                let boardQuery = boardroomDB;
                if(modStatus == "Yes"){
                    boardQuery.update({
                        moderators: firebase.firestore.FieldValue.arrayUnion(userID[0])
                    });
                }else{
                    boardQuery.update({
                        members: firebase.firestore.FieldValue.arrayUnion(userID[0])
                    });
                }
            } else {
                console.log("This feature is only for admins")
            }
            document.getElementById('memberForm').reset();
        });
    }

    //Create a new poll
    const sendPoll = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();

        var pollTitle = document.forms.boardroom_poll_form.elements.pollName.value;
        var pollPatient = document.forms.boardroom_poll_form.elements.patientList.value;
        pollPatient = pollPatient.split("=");
        var pollStartDate = document.forms.boardroom_poll_form.elements.start_date.value;
        var pollEndDate = document.forms.boardroom_poll_form.elements.end_date.value;

        jsDateStart = new Date(pollStartDate);
        timeStampStart = firebase.firestore.Timestamp.fromDate(jsDateStart);
        jsDateEnd = new Date(pollEndDate);
        timeStampEnd = firebase.firestore.Timestamp.fromDate(jsDateEnd);

        // //add validation here.
        if(pollPatient[0] == ""){
            console.log("fail");
        }else{
            boardroomDB.collection("polls").doc().set({endTime: timeStampEnd, startTime: timeStampStart, patient:pollPatient[0], pollName: pollTitle, votedUser: []});
        }
        document.getElementById('boardroom_poll_form').reset();



    }

    //clear the poll form
    const clear = function (ev) {
        ev.preventDefault();
        document.getElementById('boardroom_poll_form').reset();
    }


    //Button references 
    document.getElementById('clr_btn_poll').addEventListener('click', clear);
    document.getElementById('sub_btn_poll').addEventListener('click', sendPoll);
    document.getElementById('sub_btn').addEventListener('click', send);
    document.getElementById('signOut_btn').addEventListener('click', signOut);

    //Called to convert UNIX timestamps
    function timeConverter(UNIX_timestamp){
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
        return time;
      }


      $("ul").on("click", "button", function(e) {
        e.preventDefault();
        console.log($(this).parent())
        console.log($(this).parent().attr('value'))
        $(this).parent().remove();
        
    });
});