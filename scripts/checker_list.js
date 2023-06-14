
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-analytics.js";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

import { getStorage, ref, getDownloadURL, deleteObject, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-storage.js";
import { getDatabase, runTransaction, ref as databaseRef, onValue, child, get, set } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js"

import { firebaseConfig, app, storage, userCredential , db } from "./firebase.js";

var totalJSON, totalRequest, totalResponse;
var presenceJSON;
var weekPrevious = 0;
var lateTime = new Date();
lateTime.setHours(6);
lateTime.setMinutes(45);

function getAllStudent(){
    totalRequest++;
    getJSON('school/'+school_id+'/info.json', (status, jsonFile)=>{
        totalJSON = jsonFile;
        const schoolPath = 'school/'+school_id+'/';
        for (const [classIndex,element] of jsonFile.class.entries()){
            totalRequest++;
            getJSON(schoolPath+element.id+'/info.json', (status, jsonFile)=>{
                totalJSON.class[classIndex]["json"] = jsonFile;
                const classPath = schoolPath+element.id+'/';
                for (const [studentIndex,element] of jsonFile.student.entries()){
                    totalRequest++;
                    getJSON(classPath+element.id+'/info.json', (status, jsonFile)=>{
                        totalJSON.class[classIndex]["json"].student[studentIndex]["json"] = jsonFile;
                        totalResponse++;
                    });
                }
                totalResponse++;
            });
        }
        totalResponse++;
    });
}

function until_totalJSON_loaded(){
    const poll = (resolve,reject)=>{
        if (totalRequest==totalResponse) resolve();
        else setTimeout(_ => poll(resolve,reject), 400);
    }
    return new Promise(poll);
}

window.initCheckerList = async ()=>{
    totalJSON = {};
    totalRequest = totalResponse = 0;
    getAllStudent();
    await until_totalJSON_loaded();
    onValue(databaseRef(db, '/students'), (snapshot) => {
        presenceJSON = snapshot.val();
        loadPresenceList();
    });
}

window.studentPresenceChecked = async (id) =>{
    const pathReference = databaseRef(db, '/students/' + id);
    runTransaction(pathReference, (snapshot) => {
        const today = new Date();
        if (snapshot==null) snapshot = {};
        if (snapshot&&snapshot[dateToNum(today)]==null){
            snapshot[dateToNum(today)] = today.getTime();
        }
        return snapshot;
    });
}

const daysOfWeek = ["Thứ hai","Thứ ba","Thứ tư","Thứ năm","Thứ sáu","Thứ bảy"];
window.loadPresenceList = async ()=>{
    var dateBox = document.getElementById("date-box");
    const today = previousDate(new Date(), 7*weekPrevious);
    const firstDay = previousDate(today,today.getDay()-1);
    const lastDay = previousDate(today,today.getDay()-7);
    dateBox.innerHTML = formatDate(firstDay) + " -> " + formatDate(lastDay);

    var presenceTable = document.getElementById("presenceTable");
    presenceTable.innerHTML = "";
    for (const classElement of totalJSON.class){
        var divcard = document.createElement("div");
        divcard.setAttribute("class","card");
        var divcardbody = document.createElement("div");
        divcardbody.setAttribute("class","card-body");
        var classLabel = document.createElement("h4");
        classLabel.setAttribute("class","header-title m-b-30");
        classLabel.innerHTML = classElement.name;
        var classTable = document.createElement("table");
        classTable.setAttribute("class","table table-striped table-hover table-sm mb-0");
        classTable.setAttribute("id",classElement.id);

        var thead = document.createElement("THEAD");
        var headrow = document.createElement("TR");
        var name = document.createElement("TD");
        name.innerHTML = "Tên học sinh";
        headrow.appendChild(name);
        var birthday = document.createElement("TD");
        birthday.innerHTML = "Ngày sinh";
        headrow.appendChild(birthday);
        for (const dayInWeek of daysOfWeek){
            var x = document.createElement("TD");
            x.innerHTML = dayInWeek;
            headrow.appendChild(x);
        }
        thead.appendChild(headrow);

        var tbody = document.createElement("TBODY");
        for (const studentElement of classElement.json.student){
            var studentRow = document.createElement("TR");
            var studentName = document.createElement("TD");
            studentName.innerHTML = studentElement.name;
            var studentBirthday = document.createElement("TD");
            studentBirthday.innerHTML = formatDate(new Date(studentElement.birthday));
            studentRow.appendChild(studentName);
            studentRow.appendChild(studentBirthday);

            for (const [index,dayInWeek] of daysOfWeek.entries()){
                const today = new Date();
                today.setDate(today.getDate()-7*weekPrevious-2); //////
                today.setSeconds(0);
                today.setMilliseconds(0); //lo vl
                var x = document.createElement("TD");
                x.innerHTML = getPresenceStatus(studentElement.id, previousDate(today,today.getDay()-index-1), today).outerHTML;
                if (index+1==today.getDay()&&weekPrevious==0){
                    x.setAttribute("style","background: rgba(255, 255, 0, 0.5);");
                }
                studentRow.appendChild(x);
            }
            tbody.appendChild(studentRow);
        }

        classTable.appendChild(thead);
        classTable.appendChild(tbody);
        divcardbody.appendChild(classLabel);
        divcardbody.appendChild(classTable);
        divcard.appendChild(divcardbody);
        presenceTable.appendChild(divcard);   
    }
    $('[data-toggle="popover"]').popover('hide')
    $(document).ready(function(){
        $('[data-toggle="popover"]').popover();   
    });
}
function checkPresenceByIdAndDate(id,date,today){
    if (date.getDay()>today.getDay()&&weekPrevious==0) return -1; //not today, b
    if (presenceJSON[id]&&presenceJSON[id][dateToNum(date)]){
        const tmp = new Date(date.getTime());
        tmp.setHours(lateTime.getHours());
        tmp.setMinutes(lateTime.getMinutes());
        if (presenceJSON[id][dateToNum(date)]<=tmp.getTime()){
            return 0; //ok
        } else return 1; //late
    } else return 2; //absence
}
function getPresenceStatus(id,date,today){
    var popover_href = createPopoverOptionBox_setPresence(id,date,today);
    var icon = document.createElement("i");
    icon.setAttribute("class","bx bxs-circle");
    const status = checkPresenceByIdAndDate(id,date,today);
    if (status==-1){
        icon.setAttribute("style","color:Gray; caret-color: transparent;");
    }
    if (status==0){
        icon.setAttribute("style","color:MediumSeaGreen; caret-color: transparent;");
    } 
    if (status==1){
        icon.setAttribute("style","color:Tomato; caret-color: transparent;")
    }
    if (status==2){
        icon.setAttribute("style","color:Maroon; caret-color: transparent;");
    }
    popover_href.innerHTML = icon.outerHTML;
    return popover_href;
}
function createPopoverOptionBox_setPresence(id, date, today){
    const status = checkPresenceByIdAndDate(id,date,today);
    var popover = document.createElement("a");
    //popover.setAttribute("href","#"); khi bam se teleport len dau trang
    popover.setAttribute("href","javascript:void(0)");
    popover.setAttribute("data-toggle","popover");
    popover.setAttribute("data-html","true");
    popover.setAttribute("data-trigger","focus"); //khoi can $('[data-toggle="popover"]').popover('hide')
    var data_content;
    if (status==-1){
        data_content = formatDate(date);
    }
    if (status==0){
        var presence_time = document.createElement("div");
        presence_time.setAttribute("style","width: 100%");
        presence_time.setAttribute("class","text-center");
        presence_time.innerHTML = formatTime(new Date(presenceJSON[id][dateToNum(date)]));
        var absence_button = document.createElement("div");
        absence_button.setAttribute("class","w3-btn w3-hover-red");
        absence_button.setAttribute("style","width: 100%");
        absence_button.setAttribute("onclick","absence_student('"+id+"',"+date.getTime()+")");
        absence_button.innerHTML = "hủy điểm danh";   
        data_content =  presence_time.outerHTML + absence_button.outerHTML;
    }
    if (status==1){
        var presence_time = document.createElement("div");
        presence_time.setAttribute("style","width: 100%");
        presence_time.setAttribute("class","text-center");
        presence_time.innerHTML = formatTime(new Date(presenceJSON[id][dateToNum(date)]));
        var presence_button = document.createElement("div");
        presence_button.setAttribute("class","w3-btn w3-hover-green");
        presence_button.setAttribute("style","width: 100%");
        presence_button.setAttribute("onclick","presence_student('"+id+"',"+date.getTime()+")");
        presence_button.innerHTML = "điểm danh lại";
        var absence_button = document.createElement("div");
        absence_button.setAttribute("class","w3-btn w3-hover-red");
        absence_button.setAttribute("style","width: 100%");
        absence_button.setAttribute("onclick","absence_student('"+id+"',"+date.getTime()+")");
        absence_button.innerHTML = "hủy điểm danh";
        data_content = presence_time.outerHTML + presence_button.outerHTML + absence_button.outerHTML;
    }
    if (status==2){
        var presence_button = document.createElement("div");
        presence_button.setAttribute("class","w3-btn w3-hover-green");
        presence_button.setAttribute("style","width: 100%");
        presence_button.setAttribute("onclick","presence_student('"+id+"',"+date.getTime()+")");
        presence_button.innerHTML = "điểm danh";
        var reason_button = document.createElement("div");
        reason_button.setAttribute("class","w3-btn w3-hover-cyan");
        reason_button.setAttribute("style","width: 100%");
        reason_button.setAttribute("onclick","reason_student('"+id+"',"+date.getTime()+")");
        reason_button.innerHTML = "sửa lý do";
        var view_reason_button = document.createElement("div");
        view_reason_button.setAttribute("class","w3-btn w3-hover-amber");
        view_reason_button.setAttribute("style","width: 100%");
        view_reason_button.setAttribute("onclick","view_reason_student('"+id+"',"+date.getTime()+")");
        view_reason_button.innerHTML = "xem lý do";
        data_content = presence_button.outerHTML + reason_button.outerHTML + view_reason_button.outerHTML;
    }
    //&quot; inside "
    popover.setAttribute("data-content",data_content);
    return popover;
}
window.presence_student = (id,dateTime)=>{
    const date = new Date(dateTime);
    date.setHours(lateTime.getHours());
    date.setMinutes(lateTime.getMinutes());
    if (presenceJSON[id]==null) presenceJSON[id] = {};
    console.log(new Date(dateTime),date);
    presenceJSON[id][dateToNum(date)] = date.getTime();
    set(databaseRef(db, 'students/'), presenceJSON);
}
window.absence_student = (id,dateTime)=>{
    const date = new Date(dateTime);
    const reason = prompt("Lý do vắng");
    if (reason==null) return;
    presenceJSON[id][dateToNum(date)] = null;
    presenceJSON[id]["reason_"+dateToNum(date)] = reason;
    set(databaseRef(db, 'students/'), presenceJSON);
}
window.reason_student = (id,dateTime)=>{
    const date = new Date(dateTime);
    var default_reason = "";
    if (presenceJSON[id]) default_reason = presenceJSON[id]["reason_"+dateToNum(date)];
    const reason = prompt("Lý do vắng",default_reason);
    if (reason==null) return;
    if (presenceJSON[id]==null) presenceJSON[id] = {};
    presenceJSON[id]["reason_"+dateToNum(date)] = reason;
    set(databaseRef(db, 'students/'), presenceJSON);
}
window.view_reason_student = (id,dateTime)=>{
    const date = new Date(dateTime);
    if (presenceJSON[id]==null||presenceJSON[id]["reason_"+dateToNum(date)]==null){
        alert("Không tìm thấy lý do!");
        return;
    };
    alert(presenceJSON[id]["reason_"+dateToNum(date)]);
}
window.previousWeek = ()=>{
    if (totalRequest!=totalResponse||presenceJSON==null) return;
    if (weekPrevious<0){
        weekPrevious = 0;
    }
    weekPrevious++;
    var nextWeekButton = document.getElementById("next-week-button");
    nextWeekButton.removeAttribute("disabled");
    loadPresenceList();
}
window.nextWeek = ()=>{
    if (totalRequest!=totalResponse||presenceJSON==null) return;
    if (weekPrevious<=0){
        weekPrevious = 0;
        return;
    }
    weekPrevious--;
    if (weekPrevious==0){
        const nextWeekButton = document.getElementById("next-week-button");
        nextWeekButton.setAttribute("disabled","");
    }
    loadPresenceList();
}
window.changeTimeLate = ()=>{
    const timeLate = document.getElementById("time-late-box");
    lateTime = timeValueToDate(timeLate.value);
    loadPresenceList();
}