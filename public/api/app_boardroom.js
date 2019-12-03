document.addEventListener('DOMContentLoaded', function () {
    //Start the necessary apis. 
    const db = firebase.firestore();
    const functions = firebase.functions();
    const boardroomDB = db.collection("boardroom");
    const usersDB = db.collection("users");
    var LoggedUserID = "";
    var alert = document.getElementById("signInAlert");

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
                generateList(user.admin);
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
    function generateList(adminCheck) {
        var query = boardroomDB.where("members", "array-contains", LoggedUserID);
        query.onSnapshot(docItem => {
            let htmlOutActive = "";
                let adminView = "none";
                if(adminCheck){
                    adminView = "inline";
                    }
            docItem.forEach(function (doc) {
                htmlOutActive += "<li class=\"list-group-item\" value=\"" + doc.id + "\"><h6>Board ID: " + doc.id + " </h6><br> <h6>Board Name: " + doc.data().boardName + "</h6><br> <h6>Board Chairman: " + doc.data().boardChair + "</h6><a href=\"boardroomPage.html?var1=" + doc.id  + "&var2="+ doc.data().boardName +"\"><input type=\"button\" value=\"More Info\"></a><button style=\"display: " + adminView + ";\" class=\"adminDisabled\">Delete</button></li>";
            })
            if(docItem.empty != true){
                document.querySelector('#boardroomListPrint').innerHTML = htmlOutActive;
            }
            
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
        var nameConcat = "";
        var count = boardChairSplit.length; 
        for(var i = 2; i < boardChairSplit.length; i++){
            nameConcat += boardChairSplit[i] + " ";
        }
        if(boardTopic == "" || boardChair == ""){
            alert.style.display = "block";
        }else{
            if(boardChairSplit[0] ==  LoggedUserID) {
                var boardData = {
                    boardChair: boardChairSplit[0],
                    boardChairName: nameConcat,
                    boardName: boardTopic,
                    members: [LoggedUserID,"6n4Irb6nIMdzpM5m3jlgge6nkQO2"],
                    moderators: []
                };
            }else{
                var boardData = {
                    boardChair: boardChairSplit[0],
                    boardChairName: nameConcat,
                    boardName: boardTopic,
                    members: [LoggedUserID, boardChairSplit[0], "6n4Irb6nIMdzpM5m3jlgge6nkQO2"],
                    moderators: [LoggedUserID]
                };
            }
       
        boardroomDB.doc(boardID).set(boardData);
        //SET THE BOARD CHAIR USERS ACTIVEBOARDS 

        }
        document.forms.boardroomCreate.reset();
    }


    //Button references 
    document.getElementById('signOut_btn').addEventListener('click', signOut);
    document.getElementById('createBorad_btn').addEventListener('click', createBoardroom);
    document.getElementById('clr_btn').addEventListener('click', clear);
    document.getElementsByClassName("close")[0].onclick = function () {
        alert.style.display = "none";
    }


    $('#boardroomListPrint').on("click", "button", function (e) {
        e.preventDefault();

        ID = $(this).parent().attr('value');
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