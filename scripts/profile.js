import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-analytics.js";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

import { getStorage, ref, getDownloadURL, deleteObject, uploadBytesResumable} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-storage.js";
import { getDatabase, runTransaction, ref as databaseRef, onValue, child, get, set } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js"

import { firebaseConfig, app, storage, userCredential , db, auth, goToSchoolManager } from "./firebase.js";
// import { user_info } from "./login_signup.js";

window.defaultImageURL = "https://i.pinimg.com/originals/fe/39/79/fe39796afbe7fc15900d25008d7174c4.jpg";

window.loadProfile = async ()=>{
    var profileUsername = document.getElementById("inputUsername");
    var profileFirstname = document.getElementById("inputFirstName");
    var profileLastname = document.getElementById("inputLastName");
    var profileOrgname = document.getElementById("inputOrgName");
    var profileLocation = document.getElementById("inputLocation");
    var profileEmail = document.getElementById("inputEmailAddress");
    var profilePhone = document.getElementById("inputPhone");
    var profileBirthday = document.getElementById("inputBirthday");
    var profileImage = document.getElementById("profileImage");

    profileUsername.value = user_info.username;
    profileFirstname.value = formatString(user_info.firstname);
    profileLastname.value = formatString(user_info.lastname);
    profileOrgname.value = formatString(user_info.orgname);
    profileLocation.value = formatString(user_info.location);
    profileEmail.value = formatString(user_info.email);
    profilePhone.value = formatString(user_info.phone);
    profileBirthday.value = dateToDateInputFormat(new Date(user_info.birthday)); // = user_info.birthday :D

    await getDownloadURL(ref(storage,"profile/"+userUID+".jpeg")).then((url)=>{
        profileImage.src = url;
    }).catch((error)=>{
        profileImage.src = defaultImageURL;
    });
}

var studentImageUpload_inQueue;
window.getProfileImage = async (e)=>{
    studentImageUpload_inQueue = e.target.files[0];
    const label = document.getElementById("label_uploadImageBar");
    label.innerHTML = studentImageUpload_inQueue.name;
    console.log(studentImageUpload_inQueue);
}
window.uploadProfileImage = async ()=>{
    if (studentImageUpload_inQueue==null){
        alert("Hình ảnh không hợp lệ");
        return;
    }
    const fileName = userUID + '.jpeg';
    const pathReference = ref(storage,'profile/'+fileName);
    const uploadTask = uploadBytesResumable(pathReference,studentImageUpload_inQueue);
    uploadTask.on('state-change', (snapshot)=>{
        const label = document.getElementById("label_uploadImageBar");
        const process = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
        label.innerHTML = studentImageUpload_inQueue.name + '(' + process + '%)';
    }, (error) => {
        alert("Đã có lỗi!: " + error);
        studentImageUpload_inQueue = null;
    }, async () => {
        const label = document.getElementById("label_uploadImageBar");
        label.innerHTML = "Đã upload thành công";
        
        studentImageUpload_inQueue = null;
        loadProfile();
    })
}
function emptyIsNull(b){
    if (b&&b!="") return b;
    else return null;
}
window.profileSaveChange = ()=>{
    var profileUsername = document.getElementById("inputUsername").value;
    var profileFirstname = document.getElementById("inputFirstName").value;
    var profileLastname = document.getElementById("inputLastName").value;
    var profileOrgname = document.getElementById("inputOrgName").value;
    var profileLocation = document.getElementById("inputLocation").value;
    var profileEmail = document.getElementById("inputEmailAddress").value;
    var profilePhone = document.getElementById("inputPhone").value;
    var profileBirthday = document.getElementById("inputBirthday").value;
    user_info.username = emptyIsNull(profileUsername);
    user_info.firstname = emptyIsNull(profileFirstname);
    user_info.lastname = emptyIsNull(profileLastname);
    user_info.orgname = emptyIsNull(profileOrgname);
    user_info.location = emptyIsNull(profileLocation);
    user_info.email = emptyIsNull(profileEmail);
    user_info.phone = emptyIsNull(profilePhone);
    user_info.birthday = dateToDateInputFormat(new Date(profileBirthday)); // = profileBirthday :D
    set(databaseRef(db,"users/"+userUID),user_info);
    loadProfile();
}