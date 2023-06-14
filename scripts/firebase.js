// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-analytics.js";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

import { getStorage, ref, getDownloadURL, uploadBytes, listAll, deleteObject } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-storage.js";

import { getDatabase, runTransaction } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js"

import { imageFaceDetect, initChecker } from "./webcamDectector.js";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


export const firebaseConfig = {
    apiKey: "AIzaSyDdEcvUEfYyxX4yx-IrZUwOUHKh-HzING8",
    authDomain: "watacheck-e74a5.firebaseapp.com",
    projectId: "watacheck-e74a5",
    storageBucket: "watacheck-e74a5.appspot.com",
    messagingSenderId: "722677813784",
    appId: "1:722677813784:web:1afce8ca92f7835f15a96d",
    measurementId: "G-J1QD14GWF9",
    databaseURL: "https://watacheck-e74a5-default-rtdb.asia-southeast1.firebasedatabase.app"
}

export const app = await initializeApp(firebaseConfig);
export const storage = await getStorage(app);
export let userCredential;
export const db = await getDatabase(app);
export const auth = await getAuth(app);



//===================================TEST===================================
const test_button = document.getElementById('test_button-face-check');
test_button.addEventListener('click', async () =>{
    const pathReference = await ref(storage, '120997004_1257770131250573_6932014973153124054_n.jpg');
    getDownloadURL(pathReference).then(async (url) =>{ 
        const image = await faceapi.fetchImage(url);
        let container = imageFaceDetect(image);
        console.log(container);
        document.body.append(container); //wtf is [promise]??

        const img = document.createElement("img");
        img.setAttribute('src', url);
        img.setAttribute('class','image-list');
        const table = document.getElementById('image-container-table');
        table.append(img);
    });
    console.log(pathReference);
    console.log('hi end');  
})
//==========================================================================
export async function goToSchoolManager(){
    var xhr= new XMLHttpRequest();
    xhr.open('GET', '../htmls/school_manager_index.html', true);
    xhr.onreadystatechange= function() {
        if (this.readyState!==4) return;
        if (this.status!==200) return; // or whatever error handling you want
        document.body.innerHTML= this.responseText;
        loadClass();
        loadWelcome();
    };
    xhr.send();
}
window.goToSchoolManager = goToSchoolManager; //export to HTML and console
window.goToClassManager = async function goToClassManager(id){
    if (id==null&&school_id==null){
        console.error("Class chua co id");
        return;
    }
    if (id!=null) class_id = id;
    var xhr= new XMLHttpRequest();
    xhr.open('GET', '../htmls/class_manager_index.html', true);
    xhr.onreadystatechange= function() {
        if (this.readyState!==4) return;
        if (this.status!==200) return; // or whatever error handling you want
        document.body.innerHTML= this.responseText;
        loadStudent();
    };
    xhr.send();
}
window.goToStudentManager = async function goToStudentManager(id){
    if (id==null&&student_id==null){
        console.error("Student chua co id");
        return;
    }
    if (id!=null) student_id = id;
    var xhr= new XMLHttpRequest();
    xhr.open('GET', '../htmls/student_manager_index.html', true);
    xhr.onreadystatechange= function() {
        if (this.readyState!==4) return;
        if (this.status!==200) return; // or whatever error handling you want
        document.body.innerHTML= this.responseText;
        view_face_button_status = 0;
        loadStudentImage();
    };
    xhr.send();
}
window.goToFaceChecker = async function goToFaceChecker(){
    var xhr= new XMLHttpRequest();
    xhr.open('GET', '../htmls/face_checker_index.html', true);
    xhr.onreadystatechange = async function() {
        if (this.readyState!==4) return;
        if (this.status!==200) return; // or whatever error handling you want
        document.body.innerHTML= this.responseText;
        await initChecker();
        loadWelcome();
    };
    xhr.send();
}
window.goToCheckerList = async function goToCheckerList(){
    var xhr= new XMLHttpRequest();
    xhr.open('GET', '../htmls/checker_list_index.html', true);
    xhr.onreadystatechange = async function() {
        if (this.readyState!==4) return;
        if (this.status!==200) return; // or whatever error handling you want
        document.body.innerHTML= this.responseText;
        await initCheckerList();
        loadWelcome();
    };
    xhr.send();
}
window.goToLoginSignUp = async function goToLoginSignUp(){
    var xhr= new XMLHttpRequest();
    xhr.open('GET', '../htmls/login_signup_index.html', true);
    xhr.onreadystatechange = async function() {
        if (this.readyState!==4) return;
        if (this.status!==200) return; // or whatever error handling you want
        document.body.innerHTML= this.responseText;
    };
    xhr.send();
}
window.goToProfile = async function goToProfile(){
    var xhr= new XMLHttpRequest();
    xhr.open('GET', '../htmls/profile_index.html', true);
    xhr.onreadystatechange = async function() {
        if (this.readyState!==4) return;
        if (this.status!==200) return; // or whatever error handling you want
        document.body.innerHTML= this.responseText;
        loadProfile();
    };
    xhr.send();
}
async function loadWelcome(){
    var welcomeBox = document.getElementById("welcome-box");
    const welcomeBoxHeight = welcomeBox.offsetHeight;

    var userAvatar = document.createElement("img"); //profile image
    userAvatar.setAttribute("class","img-account-profile rounded-circle mb-2 ");
    userAvatar.setAttribute("style","height:100%; aspect-ratio : 1 / 1 ; object-fit:cover;");
    await getDownloadURL(ref(storage,'profile/'+userUID+".jpeg")).then((url)=>{
        userAvatar.setAttribute("src",url);
    }).catch((error)=>{
        userAvatar.setAttribute("src",defaultImageURL)
    });
    var welcomeText = document.createElement("span");
    welcomeText.setAttribute("style","font-size: " + welcomeBoxHeight/2 + 'px; line-height: ' + welcomeBoxHeight + "px");
    welcomeText.innerHTML = " Xin chào " + user_info.username.bold() + "!";


    welcomeBox.innerHTML = "";
    welcomeBox.appendChild(userAvatar);
    welcomeBox.appendChild(welcomeText);
}

//use 'blob' to send request with input URL
window.getBlob = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};
window.getJSON = function(path,callback){
    const pathReference = ref(storage,path);
    getDownloadURL(pathReference).then((url)=>{
        getBlob(url, (status, blob)=>{
            var file = new File([blob], "name", { type: blob.type});
            const fr = new FileReader();
            fr.readAsText(file);
            fr.addEventListener('load',()=>{
                const res = fr.result;
                const jsonFile = JSON.parse(res);
                callback(status,jsonFile);
            })
        })
    })
}

//upload JSON file
window.uploadJSON = async function uploadJSON(obj, directory){
    var dictstring = JSON.stringify(obj);
    var f = new File([dictstring], "info.json", {type: "application/json"});
    var fr = new FileReader();
    const pathReference = await ref(storage, directory);
    await uploadBytes(pathReference, f).then((snapshot) =>{
    })
}

window.deleteFolder = async (path)=>{
    const pathReference = await ref(storage,path);
    listAll(pathReference).then(dir => {
        dir.items.forEach(fileRef => deleteFile(fileRef.fullPath));
        dir.prefixes.forEach(folderRef => deleteFolder(folderRef.fullPath))
    }).catch(error => console.log(error));
}
window.deleteFile = async (path)=>{
    const pathReference = await ref(storage,path);
    deleteObject(pathReference).then(()=>{
    });
}


//generate random id
function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
window.uuidv4 = uuidv4;

window.uuidv4_print = ()=>{
    const id = uuidv4();
    console.log("generated ",id);
    return id;
};

window.padTo2Digits = function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  
window.formatDate = function formatDate(date) {
    if (isNaN(date)){
        return "Chưa xác định";
    }
    return [
      padTo2Digits(date.getDate()),
      padTo2Digits(date.getMonth() + 1),
      date.getFullYear(),
    ].join('/');
}
window.formatSize = function formatSize(size){
    if (size<=1024){
        return size + " B";
    }
    size /= 1024;
    if (size<=1024){
        return size.toFixed(1) + " KB";
    }
    size /= 1024;
    return size.toFixed(2) + " MB";
}
window.formatLabel = (label,dist)=>{
    return label + ' (' + dist.toFixed(2) + ')';
}
window.dateToNum = function datetoNum(date) { //for checker-list
    return [
      padTo2Digits(date.getDate()),
      padTo2Digits(date.getMonth() + 1),
      date.getFullYear(),
    ].join('') ;
}
window.previousDate = function previousDate(date, dayscount){
    let tmp = new Date(date.getTime()); //cloning object
    tmp.setDate(tmp.getDate()-dayscount);
    return tmp;
}
window.formatTime = function formatTime(date){ //for checker-list
    return [
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        padTo2Digits(date.getSeconds()),
    ].join(':');
}
window.timeValueToDate = function timeValueToDate(time){ //vi Date() la dinh dang chuan
    var tmp = new Date();
    var hours = time[0] + time[1];
    var minutes = time[3] + time[4];
    tmp.setHours(hours);
    tmp.setMinutes(minutes);
    tmp.setSeconds(0);
    return tmp;
}
window.dateToDateInputFormat = function dateToDateInputFormat(date) {
    if (isNaN(date)) return "";
    return [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('-') ;
}
window.formatString = function formatStirng(val){
    if (val==null) return "";
    return val;
}