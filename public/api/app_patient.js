document.addEventListener('DOMContentLoaded', function () {
    //Start the necessary apis. 
    const db = firebase.firestore();
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

    //Hides elemnts depending on admin status
    function setViability(user, y) {
        const adminUi = document.querySelectorAll('.admin');
        if (user.admin) {
            y.innerHTML += "    Admin ";
            adminUi.forEach(items => items.style.display = 'block');
            createLists(user.admin)
        }else{
            createLists(false)
        }


    }

    function createLists(adminCheck){
        patientDB.onSnapshot((doc) => {
            let htmlList = "";
            doc.forEach(function (doc) {
                htmlList += "<li class=\"list-group-item\" value=\""+doc.id + "\"> <h6>Patient ID: " + doc.id + " </h6><br> <h6>Patient Name: " + doc.data().pntName + "</h6><br> <h6>Patient Gender: " + doc.data().pntGender + "</h6><br> <h6>Patient Age: " + doc.data().pntAge + "</h6> <br> <h6>Patient Description: " + doc.data().pntDescription + "</h6><button  style=\"display: none;\" class=\"adminDisabled\">Delete</button></li>";
            });
            document.querySelector('#patient_List').innerHTML = htmlList;
            if(adminCheck){
                let adminDisableOptions = document.querySelectorAll('.adminDisabled');
                adminDisableOptions.forEach(items => items.style.display = 'block');
                }
        });
    }
    





    //sign the user out of auth
    const signOut = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        firebase.auth().signOut().then(function () {
        }).catch(function (error) {
        });
    }


    //Clear the form
    const clear = function (ev) {
        ev.preventDefault();
        document.getElementById('patientForm').reset();
    }

    //Send the data to the server on submit
    const send = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        //validation can be added here with a function.
        let pntName = document.forms.patientForm.elements.patientName.value;
        let pntGender = document.forms.patientForm.elements.patientGender.value;
        let pntAge = document.forms.patientForm.elements.patientAge.value;
        let pntDescription = document.forms.patientForm.elements.PatientDesc.value;
        let patientID = ID();

        //XSS filter
        pntName = filterXSS(pntName);
        pntGender = filterXSS(pntGender);
        pntAge = filterXSS(pntAge);
        pntDescription = filterXSS(pntDescription);

        patientDB.doc(patientID).set({pntName: pntName,pntDescription: pntDescription,pntAge:pntAge,pntGender: pntGender});
        document.getElementById('patientForm').reset();
      }
 
      //create the random ID
      var ID = function () {
        return 'PNID_' + Math.random().toString(36).substr(2, 9);
      };
      


    //Button references 
    document.getElementById('clr_btn').addEventListener('click', clear);
    document.getElementById('sub_btn').addEventListener('click', send);
    document.getElementById('signOut_btn').addEventListener('click', signOut);

    $('#patient_List').on("click", "button", function (e) {
        e.preventDefault();

        ID = $(this).parent().attr('value');
        $(this).parent().remove();
    
        patientDB.doc(ID).delete().then(function () {
            console.log("Patient document successfully deleted!");
        }).catch(function (error) {
            console.error("Error removing document: ", error);
        });
    });

});