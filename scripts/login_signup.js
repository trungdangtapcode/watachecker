import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-analytics.js";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

import { getStorage, ref, getDownloadURL, deleteObject, uploadBytesResumable} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-storage.js";
import { getDatabase, runTransaction, ref as databaseRef, onValue, child, get, set } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js"

import { firebaseConfig, app, storage, userCredential , db, auth, goToSchoolManager } from "./firebase.js";

var user_val; //default (info) by auth
window.user_info = {};
window.userUID = "";

window.showLogin = ()=>{
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
}
window.showSignup = ()=>{
    document.getElementById("signup-form").style.display = "block";
    document.getElementById("login-form").style.display = "none";
}
window.login = ()=>{
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    signInWithEmailAndPassword(auth,email,password).then((userCredential)=>{
        user = userCredential;
    }).catch((error)=>{
        alert("Thông tin không hợp lệ: " + error);
    });
}
window.logout = ()=>{
    signOut(auth).then(()=>{
        user_info = null; //{}
        alert("Đăng xuất thành công");
        window.location.reload();
    });
}
window.signup = ()=>{
    const username = document.getElementById("signupUsername").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const school = document.getElementById("signupSchool").value;
    const role = document.getElementById("signupRole").value;
    const confirmPassword = document.getElementById("signupConfirmPassword").value;
    if (password!=confirmPassword){
        alert("Xác nhận mật khẩu không chính xác!");
        return;
    }
    createUserWithEmailAndPassword(auth,email,password).then((userCredential) => {
        const user = userCredential.user;
        user_info = {
            "username": username,
            "role": role,
            "school": school
        };
        set(databaseRef(db,'/users/'+user.uid), user_info
        ).then(() => {
            alert("Đăng ký thành công");
        });   
    });
}
onAuthStateChanged(auth, async (user) => {
    if (user){
        user_val = user;
        userUID = user.uid;
        loadHomePage();
    } else {
        goToLoginSignUp();
    }
});
  
window.loadHomePage = ()=>{
    get(databaseRef(db,'/users/'+user_val.uid)).then(async (snapshot)=>{
        if (snapshot.exists()||user_info){
            if (snapshot.exists()) user_info = snapshot.val();
            school_id = user_info.school;
            await getSchoolInfo(school_id);
            if (user_info.role==0){
                goToFaceChecker();
            } else if (user_info.role==1){
                goToCheckerList();
            } else if (user_info.role==2){

            } else if (user_info.role==3){
                goToSchoolManager();
            }
        } else {
            alert("Thông tin tài khoản lỗi!");
            logout();
        }
    });
}