document.addEventListener('DOMContentLoaded', function () {
    //Start the necessary apis. 
    const db = firebase.firestore();
    const functions = firebase.functions();
    const boardroomDB = db.collection("boardroom");
    const usersDB = db.collection("users");
    var LoggedUserID = "";

    //check if the user is logged on
    firebase.auth().onAuthStateChanged(user => {
        var x = document.getElementById("signOut_btn");
        var y = document.getElementById("name_test");
        if (user) {
            x.style.display = "block";
            y.innerHTML = "User ID: " + user.uid + "   ";
            user.getIdTokenResult().then(IdTokenResult => {
                user.admin = IdTokenResult.claims.admin;
                LoggedUserID = IdTokenResult.claims.user_id;
                setViability(user, y);
                generateList(user.uid, user.admin);
            });
        } else {
            LoggedUserID = "";
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

    //DB call to fill list of Users
    usersDB.onSnapshot(doc => {
        let htmlOutForm = "<option selected></option>";
        doc.forEach(function (doc) {
            //    doc.data() is never undefined for query doc snapshots
            htmlOutForm += "<option>" + doc.id + " => " + doc.data().userName + "</option>";
        });
        document.querySelector('#boardChair').innerHTML += htmlOutForm;
    });

    
    //DB call to fill Boardroom list
    function generateList(currentUser, adminCheck) {
        usersDB.doc(currentUser).collection('activeBoards').onSnapshot(doc => {
            document.querySelector('#boardroomListPrint').innerHTML = "";
            let htmlOutActive = "";
            let adminView = "none";
            if(adminCheck){
                adminView = "inline";
                }
            doc.forEach(function (board) {
                let curretID = board.id;
                boardroomDB.doc(board.id).onSnapshot(doc => {
                    htmlOutActive = "<li class=\"list-group-item\" value=\"" + doc.id + "\"><h6>Board ID: " + doc.id + " </h6><br> <h6>Board Name: " + doc.data().boardName + "</h6><br> <h6>Board Chairman: " + doc.data().boardChair + "</h6><a href=\"boardroomPage.html?var1=" + doc.id + "\"><input type=\"button\" value=\"More Info\"></a><button style=\"display: "+ adminView +";\" class=\"adminDisabled\">Delete</button></li>";
                    document.querySelector('#boardroomListPrint').innerHTML += htmlOutActive;
                    
                }, function(error) {
                    console.log("A none existent/deleted Board has been detected");

                    usersDB.doc(LoggedUserID).collection("activeBoards").doc(curretID).delete().then(function () {
                        console.log("ActiveBoards document successfully deleted!");
                    }).catch(function (error) {
                        console.error("Error removing document: ", error);
                    });

                });

            });
            

        });
    }

    //create the random ID
    var ID = function () {
        return 'BID_' + Math.random().toString(36).substr(2, 9);
    };

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
        document.getElementById('boardroomCreate').reset();
    }

    const createBoardroom = function (ev) {
        ev.preventDefault();
        var boardTopic = document.forms.boardroomCreate.elements.boardTopic.value;
        var boardChair = document.forms.boardroomCreate.elements.BoardChair.value;
        boardChairSplit = boardChair.split(' ')
        var boardID = ID();

        //VALIDATION HERE
        
            usersDB.doc(LoggedUserID).collection("activeBoards").doc(boardID).set({});
            var boardData = {
                boardChair: boardChairSplit[0],
                boardName: boardTopic,
                members: [LoggedUserID],
                moderators: []
            };
            boardroomDB.doc(boardID).set(boardData);
            document.getElementById('boardroomCreate').reset();
            //SET THE BOARD CHAIR USERS ACTIVEBOARDS 
        
    }


    //Button references 
    document.getElementById('signOut_btn').addEventListener('click', signOut);
    document.getElementById('createBorad_btn').addEventListener('click', createBoardroom);
    document.getElementById('clr_btn').addEventListener('click', clear);



    $('#boardroomListPrint').on("click", "button", function (e) {
        e.preventDefault();
        
         ID = $(this).parent().attr('value');
         console.log(ID);
        $(this).parent().remove();

        usersDB.doc(LoggedUserID).collection("activeBoards").doc(ID).delete().then(function () {
            console.log("ActiveBoards document successfully deleted!");
        }).catch(function (error) {
            console.error("Error removing document: ", error);
        });
        
        boardroomDB.doc(ID).delete().then(function () {
            console.log("Boardroom ocument successfully deleted!");
        }).catch(function (error) {
            console.error("Error removing document: ", error);
        });

        
    });
});