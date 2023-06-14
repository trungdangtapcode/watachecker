// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-analytics.js";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

import { getStorage, ref, getDownloadURL, deleteObject, uploadBytesResumable  } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-storage.js";

import { firebaseConfig, app, storage, userCredential } from "./firebase.js";

window.school_id = "df70f4d5-f7dd-4e83-b2fe-fa589ae6aeae";
window.class_id = "";
window.student_id = "";
var school_info;
var class_info;
var student_info;

//url => blob => File => Text => JSON
window.getSchoolInfo = async function getSchoolInfo(id){
    const ref_info = 'school/'+id+'/info.json';
    const pathReference = await ref(storage, ref_info);
    getDownloadURL(pathReference).then(async (url) =>{ 
        getBlob(url, function(status, blob){
            var file = new File([blob], "name", { type: blob.type});
            const fr = new FileReader();
            fr.readAsText(file);
            fr.addEventListener('load', ()=>{
                const res = fr.result;
                school_info = JSON.parse(res);
                schoolFlag = true;
            });
        });
    });
    await until_schoolFlag();
}
var schoolFlag = false;
function until_schoolFlag(){
    const poll = (resolve,reject)=>{
        if (schoolFlag) resolve();
        else setTimeout(_ => poll(resolve,reject), 400);
    }
    return new Promise(poll);
}

//a mini/small selected pop up listed
function createPopoverOptionBox(classIndex){
    var popover = document.createElement("a");
    //popover.setAttribute("href","#"); khi bam se teleport len dau trang
    popover.setAttribute("href","javascript:void(0)");
    popover.setAttribute("data-toggle","popover");
    popover.setAttribute("data-html","true");
    popover.setAttribute("data-trigger","focus"); //khoi can $('[data-toggle="popover"]').popover('hide')
    var delete_button = document.createElement("div");
    delete_button.setAttribute("class","w3-btn w3-hover-red");
    delete_button.setAttribute("style","width: 100%");
    delete_button.setAttribute("onclick","school_removeClass("+classIndex+")");
    delete_button.innerHTML = "xóa lớp";
    var rename_button = document.createElement("div");
    rename_button.setAttribute("class","w3-btn w3-hover-green");
    rename_button.setAttribute("style","width: 100%");
    rename_button.setAttribute("onclick","school_renameClass("+classIndex+")");
    rename_button.innerHTML = "đổi tên";
    //&quot; inside "
    var data_content = rename_button.outerHTML + '<br>' + delete_button.outerHTML;
    popover.setAttribute("data-content",data_content);
    return popover;
}

window.loadClass = async function loadClass(){ //loadClass + school_info
    const classTable = document.getElementById("classList");
    while (classTable.rows[1]!=undefined) classTable.deleteRow(1);
    var x = document.createElement("TBODY");
    school_info.class.forEach((element,index) => {
        const click_cmd = 'goToClassManager("'+element.id+'")';
        var y = document.createElement("TR");
        
        var name = document.createElement("TD"); 
        name.setAttribute("onclick",click_cmd);
        name.innerHTML = element.name;

        var members = document.createElement("TD");
        members.setAttribute("onclick",click_cmd);
        members.innerHTML = element.members;

        var id = document.createElement("TD");
        id.setAttribute("onclick",click_cmd);
        id.innerHTML = element.id;

        var option_button = document.createElement("TD");
        // <a href="#" data-toggle="popover" data-html="true" data-content="<image width='40px' height='40px' src='../media/products/17.png' /> <b>Popover chứa hình ảnh</b>">Toggle popover</a>
        var popover_href = createPopoverOptionBox(index);
        popover_href.innerHTML = '<i class="fa fa-ellipsis-h font-24"></i>';
        option_button.innerHTML = popover_href.outerHTML;
        

        y.appendChild(name);
        y.appendChild(members);
        y.appendChild(id);
        y.appendChild(option_button);

        x.appendChild(y);
    });
    classTable.appendChild(x);
    $('[data-toggle="popover"]').popover('hide')
    $(document).ready(function(){
        $('[data-toggle="popover"]').popover();   
    });

    var schoolName = document.getElementById("inputSchoolName");
    var schoolFrom = document.getElementById("inputSchoolFrom");
    var schoolSlogan = document.getElementById("inputSchoolSlogan");
    schoolName.value = school_info.school_name;
    schoolFrom.value = school_info.from;
    schoolSlogan.value = school_info.slogan;
}

//khong can async, new co async dung await khong tra ve promise
function checkNewClassNameAvailable(name){
    for (const element of school_info.class){
        if (element.name == name){
            alert("Tên lớp này đã có rồi!");
            return false;
        }
    };
    return true;
};
window.addClass = async function addClass(){
    //pop up later
    let new_class_name = prompt("Nhập tên lớp:", "12A1");
    if (checkNewClassNameAvailable(new_class_name)==true&&new_class_name!=null){
        var new_class = {};
        new_class["name"] = new_class_name;
        new_class["members"] = 0;
        new_class["id"] = uuidv4();
        school_info.class.push(new_class);

        var new_class_json = {};
        new_class_json["class_name"] = new_class_name;
        new_class_json["members"] = 0;
        new_class_json["id"] = new_class["id"];
        new_class_json["monitor"] = "";
        new_class_json["homeroom"] = "";
        new_class_json["student"] = [];

        uploadJSON(school_info,'school/'+school_id+'/info.json');
        uploadJSON(new_class_json,'school/'+school_id+'/'+new_class["id"]+'/info.json');
        loadClass();
    } 
}
window.school_renameClass = async function school_renameClass(index){
    $('[data-toggle="popover"]').popover('hide'); 
    const newName = prompt("Nhập tên lớp:", school_info.class[index].name);
    if (newName!=null) school_info.class[index].name = "";
    if (checkNewClassNameAvailable(newName)==true&&newName!=null){
        school_info.class[index].name = newName;
        uploadJSON(school_info,'school/'+school_id+'/info.json');
        await getJSON('school/'+school_id+'/'+school_info.class[index].id+'/info.json', async (status,jsonFile)=>{
            jsonFile.class_name = newName;
            await uploadJSON(jsonFile,'school/'+school_id+'/'+school_info.class[index].id+'/info.json');
        })
        loadClass();
    }
}
window.school_removeClass = async function school_removeClass(index){
    $('[data-toggle="popover"]').popover('hide'); 
    if (confirm("Xác nhận xóa lớp")==true){
        deleteFolder('school/'+school_id+'/'+school_info.class[index].id);
        school_info.class.splice(index,1);
        uploadJSON(school_info,'school/'+school_id+'/info.json');
        loadClass();
    }
}
window.school_update_info = async ()=>{
    if (confirm("Xác nhận cập nhật")==false) return; 
    var schoolName = document.getElementById("inputSchoolName");
    var schoolFrom = document.getElementById("inputSchoolFrom");
    var schoolSlogan = document.getElementById("inputSchoolSlogan");
    school_info.school_name = schoolName.value;
    school_info.from = schoolFrom.value;
    school_info.slogan = schoolSlogan.value;
    await uploadJSON(school_info,'school/'+school_id+'/info.json');
    loadClass();
}




//loadStudent => getClass => class_info => turn classFlag => continue loadStudent
var classFlag;
async function getClassInfo(id){
    const ref_info = 'school/'+school_id+'/'+id+'/info.json';
    const pathReference = await ref(storage, ref_info);
    await getDownloadURL(pathReference).then(async (url) =>{ 
        await getBlob(url, function(status, blob){
            var file = new File([blob], "name", { type: blob.type});
            const fr = new FileReader();
            fr.readAsText(file);
            fr.addEventListener('load', ()=>{
                const res = fr.result;
                class_info = JSON.parse(res);
                classFlag = 1;
            });
        });
    });
}
function until_classFlag(){
    const poll = (resolve,reject) => {
        if (classFlag==-1) reject();
        if (classFlag==1) resolve();
        else setTimeout(_ => poll(resolve,reject), 400);
    }
    return new Promise(poll);
}
window.loadStudent = async ()=>{
    const studentTable = document.getElementById("studentList");
    while (studentTable.rows[1]!=undefined) studentTable.deleteRow(1);
    classFlag = 0;
    await getClassInfo(class_id);
    await until_classFlag();
    var x = document.createElement("TBODY");
    for (const [index,student] of class_info.student.entries()){
        const click_cmd = 'goToStudentManager("'+student.id+'")';
        var y = document.createElement("TR");
        
        var num = document.createElement("TD");
        num.setAttribute("onclick",click_cmd);
        num.innerHTML = index+1;

        var name = document.createElement("TD"); 
        name.setAttribute("onclick",click_cmd);
        name.innerHTML = student.name;

        var birthday = document.createElement("TD");
        birthday.setAttribute("onclick",click_cmd);
        birthday.innerHTML = formatDate(new Date(student.birthday));

        var id = document.createElement("TD");
        id.setAttribute("onclick",click_cmd);
        id.innerHTML = student.id;

        var option_button = document.createElement("TD");
        var popover_href = createPopoverOptionBox_student(index);
        popover_href.innerHTML = '<i class="fa fa-ellipsis-h font-24"></i>';
        option_button.innerHTML = popover_href.outerHTML;
        
        y.appendChild(num);
        y.appendChild(name);
        y.appendChild(birthday);
        y.appendChild(id);
        y.appendChild(option_button);

        x.appendChild(y);
    }
    studentTable.appendChild(x);
    $('[data-toggle="popover"]').popover('hide')
    $(document).ready(function(){
        $('[data-toggle="popover"]').popover();   
    });

    var className = document.getElementById("inputClassName");
    var classMonitor = document.getElementById("inputClassMonitor");
    var classHomeroom = document.getElementById("inputClassHomeroom");
    className.value = class_info.class_name;
    classMonitor = class_info.monitor;
    classHomeroom = class_info.homeroom;
}
function createPopoverOptionBox_student(studentIndex){
    var popover = document.createElement("a");
    //popover.setAttribute("href","#"); khi bam se teleport len dau trang
    popover.setAttribute("href","javascript:void(0)");
    popover.setAttribute("data-toggle","popover");
    popover.setAttribute("data-html","true");
    popover.setAttribute("data-trigger","focus"); //khoi can $('[data-toggle="popover"]').popover('hide')
    var delete_button = document.createElement("div");
    delete_button.setAttribute("class","w3-btn w3-hover-red");
    delete_button.setAttribute("style","width: 100%");
    delete_button.setAttribute("onclick","class_removeStudent("+studentIndex+")");
    delete_button.innerHTML = "xóa học sinh";
    var rename_button = document.createElement("div");
    rename_button.setAttribute("class","w3-btn w3-hover-green");
    rename_button.setAttribute("style","width: 100%");
    rename_button.setAttribute("onclick","class_renameStudent("+studentIndex+")");
    rename_button.innerHTML = "đổi tên";
    //&quot; inside "
    var data_content = rename_button.outerHTML + '<br>' + delete_button.outerHTML;
    popover.setAttribute("data-content",data_content);
    return popover;
}
//khong can async, new co async dung await khong tra ve promise
function checkNewStudentNameAvailable(name){
    for (const element of class_info.student){
        if (element.name == name){
            alert("Tên lớp này đã có rồi!");
            return false;
        }
    };
    return true;
};
window.addStudent = async function addStudent(){
    //pop up later
    let new_student_name = prompt("Nhập tên học sinh:", "Nguyễn Văn A");
    if (checkNewStudentNameAvailable(new_student_name)==true&&new_student_name!=null){
        var new_student = {};
        new_student["name"] = new_student_name;
        new_student["birthday"] = "Chưa xác định";
        new_student["id"] = uuidv4();
        class_info.student.push(new_student);
        class_info.members++;

        var new_student_json = new_student;
        new_student_json["identity"] = "";
        new_student_json["phone"] = "";
        new_student_json["born"] = "";
        new_student_json["num"] = 0;
        new_student_json["image"] = [];

        school_info.class[school_info.class.findIndex((element)=>element.id==class_id)].members++;
        await uploadJSON(school_info,'school/'+school_id+'/info.json');
        await uploadJSON(class_info,'school/'+school_id+'/'+class_id+'/info.json');
        await uploadJSON(new_student_json,'school/'+school_id+'/'+class_id+'/'+new_student["id"]+'/info.json');
        loadStudent();
    } 
}
window.class_renameStudent = async function class_renameStudent(index){
    $('[data-toggle="popover"]').popover('hide'); 
    const newName = prompt("Nhập tên học sinh:", class_info.student[index].name);
    if (newName!=null) class_info.student[index].name = "";
    if (checkNewStudentNameAvailable(newName)==true&&newName!=null){
        class_info.student[index].name = newName;
        await uploadJSON(class_info,'school/'+school_id+'/'+class_id+'/info.json');
        await getJSON('school/'+school_id+'/'+class_id+'/'+class_info.student[index].id+'/info.json', async (status,jsonFile)=>{
            jsonFile.name = newName;
            await uploadJSON(jsonFile,'school/'+school_id+'/'+class_id+'/'+class_info.student[index].id+'/info.json');
        })
        loadStudent();
    }
}
window.class_removeStudent = async function class_removeStudent(index){
    $('[data-toggle="popover"]').popover('hide'); 
    if (confirm("Xác nhận xóa học sinh")==true){
        deleteFolder('school/'+school_id+'/'+class_id+'/'+class_info.student[index].id);
        class_info.student.splice(index,1);
        class_info.members--;
        await uploadJSON(class_info,'school/'+school_id+'/'+class_id+'/info.json');
        school_info.class[school_info.class.findIndex((element)=>element.id==class_id)].members--;
        await uploadJSON(school_info,'school/'+school_id+'/info.json');
        loadStudent();
    }
}
window.class_update_info = async ()=>{
    if (confirm("Xác nhận cập nhật")==false) return;
    var className = document.getElementById("inputClassName");
    var classMonitor = document.getElementById("inputClassMonitor");
    var classHomeroom = document.getElementById("inputClassHomeroom");
    class_info.class_name = className.value;
    class_info.monitor = classMonitor;
    class_info.homeroom = classHomeroom;
    await uploadJSON(class_info,'school/'+school_id+'/'+class_id+'/info.json');
    school_info.class[school_info.class.findIndex((element)=>element.id==class_id)].name = class_info.class_name;
    await uploadJSON(school_info,'school/'+school_id+'/info.json');
}



var studentImageUpload_inQueue; //File
var studentImageFlag; //boolean
var student_imageArray_URL = []; //array of string
async function getStudentInfo(id){
    const ref_info = 'school/'+school_id+'/'+class_id+'/'+id+'/info.json';
    const pathReference = await ref(storage, ref_info);
    await getDownloadURL(pathReference).then(async (url) =>{ 
        await getBlob(url, function(status, blob){
            var file = new File([blob], "name", { type: blob.type});
            const fr = new FileReader();
            fr.readAsText(file);
            fr.addEventListener('load', ()=>{
                const res = fr.result;
                student_info = JSON.parse(res);
                studentImageFlag = 1;
            });
        });
    });
}
function until_studentImageFlag(){
    const poll = (resolve,reject) => {
        if (studentImageFlag==-1) reject();
        if (studentImageFlag==1) resolve();
        else setTimeout(_ => poll(resolve,reject), 400);
    }
    return new Promise(poll);
}
window.loadStudentImage = async ()=>{
    const viewFaceButton = document.getElementById("view-face-button");
    viewFaceButton.setAttribute("disabled","");
    studentImageFlag = 0;
    await getStudentInfo(student_id);
    await until_studentImageFlag();
    studentImageUpload_inQueue = null;
    student_imageArray_URL = [];
    const imageTable = document.getElementById("table_studentImage");
    imageTable.innerHTML = "";
    for (const [index,element] of student_info.image.entries()){
        const pathReference = await ref(storage,'school/'+school_id+'/'+class_id+'/'+student_id+'/'+element.idName);
        await getDownloadURL(pathReference).then((url) =>{
            student_imageArray_URL.push(url);
            showStudentImage(url,index,element.name,element.size,element.date);
        });
    }

    var studentName = document.getElementById("inputStudentName");
    var studentBirthday = document.getElementById("inputStudentBirthday");
    var studentBorn = document.getElementById("inputStudentBorn");
    var studentPhone = document.getElementById("inputStudentPhone");
    var studentIdentity = document.getElementById("inputStudentIdentity");
    studentName.value = student_info.name;
    studentBirthday.value = dateToDateInputFormat(new Date(student_info.birthday));
    studentBorn.value = student_info.born;
    studentPhone.value = student_info.phone;
    studentIdentity.value = student_info.identity;
    viewFaceButton.removeAttribute("disabled");
}
function showStudentImage(url,index,fileName,fileSize,fileDate){
    const imageTable = document.getElementById("table_studentImage");
    var divcol = document.createElement("div");
    divcol.setAttribute("class","col-lg-3 col-md-4 col-sm-12");
    var divcard = document.createElement("div");
    divcard.setAttribute("class","card");
    var divfile = document.createElement("file");
    divfile.setAttribute("class","file");
    var href = document.createElement("a");
    if (view_face_button_status){
        href.setAttribute("href", "javascript:void(0)");
        href.setAttribute("onclick","showPopUpFace('"+url+"')");
    } else {
        href.setAttribute("href", url);
        href.setAttribute("target","_blank");
    }
    
    var delete_button_div = document.createElement("div");
    delete_button_div.setAttribute("class","hover");
    var delete_button = document.createElement("buttton");
    delete_button.setAttribute("type","button");
    delete_button.setAttribute("class","btn btn-icon btn-danger");
    delete_button.setAttribute("onclick","deleteStudentImage("+index+")");
    var delete_icon = document.createElement("i");
    delete_icon.setAttribute("class","fa fa-trash");
    delete_button.innerHTML = delete_icon.outerHTML;
    delete_button_div.innerHTML = delete_button.outerHTML;

    var image_div = document.createElement("div");
    image_div.setAttribute("class","image");
    var myImage = document.createElement("img");
    myImage.src = url;
    myImage.setAttribute("alt","img");
    myImage.setAttribute("class","img-fluid");
    image_div.innerHTML = myImage.outerHTML;

    var file_info = document.createElement("div");
    file_info.setAttribute("class","file-name");
    var file_name = document.createElement("p");
    file_name.setAttribute("class","m-b-5 text-muted");
    file_name.innerHTML = fileName;
    var size_and_date = document.createElement("small");
    var date_span = document.createElement("span");
    date_span.setAttribute("class","date text-muted");
    date_span.innerHTML = fileDate;
    size_and_date.innerHTML = fileSize + ' ' + date_span.outerHTML;
    file_info.appendChild(file_name);
    file_info.appendChild(size_and_date);

    href.appendChild(delete_button_div);
    href.appendChild(image_div);
    href.appendChild(file_info);
    divfile.innerHTML = href.outerHTML;
    divcard.innerHTML = divfile.outerHTML;
    divcol.innerHTML = divcard.outerHTML;
    imageTable.appendChild(divcol);
}
window.getStudentImage = async (e)=>{
    studentImageUpload_inQueue = e.target.files[0];
    const label = document.getElementById("label_uploadImageBar");
    label.innerHTML = studentImageUpload_inQueue.name;
    console.log(studentImageUpload_inQueue);
    console.log(student_info);
}
window.uploadStudentImage = async ()=>{
    if (studentImageUpload_inQueue==null){
        alert("Hình ảnh không hợp lệ");
        return;
    }
    const imageID = uuidv4();
    const fileName = imageID + '.jpeg'; //ID + name(type) = idName :D
    const pathReference = ref(storage,'school/'+school_id+'/'+class_id+'/'+student_id+'/'+fileName);
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
        
        var new_image_json = {};
        new_image_json["idName"] = fileName;
        new_image_json["name"] = studentImageUpload_inQueue.name;
        new_image_json["date"] = formatDate(studentImageUpload_inQueue.lastModifiedDate);
        new_image_json["size"] = formatSize(studentImageUpload_inQueue.size);
        student_info.image.push(new_image_json);
        await uploadJSON(student_info,'school/'+school_id+'/'+class_id+'/'+student_id+'/info.json');

        studentImageUpload_inQueue = null;
        loadStudentImage();
    })
}
window.deleteStudentImage = async (index) => {
    if (confirm("Xác nhận xóa hình này")==true);
    await deleteFile('school/'+school_id+'/'+class_id+'/'+student_id+'/'+student_info.image[index].idName);
    student_info.image.splice(index,1);
    await uploadJSON(student_info,'school/'+school_id+'/'+class_id+'/'+student_id+'/info.json');
    loadStudentImage();
}
window.student_update_info = async ()=>{
    if (confirm("Xác nhận cập nhật")==false) return;
    var studentName = document.getElementById("inputStudentName");
    var studentBirthday = document.getElementById("inputStudentBirthday");
    var studentBorn = document.getElementById("inputStudentBorn");
    var studentPhone = document.getElementById("inputStudentPhone");
    var studentIdentity = document.getElementById("inputStudentIdentity");
    student_info.name = studentName.value;
    student_info.birthday = dateToDateInputFormat(new Date(studentBirthday.value));
    //(new Date(studentBirthday.value)).getTime(); hop ly hon nhung format cho de coi voi lai no cx hoat dong duoc
    //hoac = studentBirthday.value luon nhung bi xung dot voi du lieu cu :v (profile)
    student_info.born = studentBorn.value;
    student_info.phone = studentPhone.value;
    student_info.identity = studentIdentity.value;
    await uploadJSON(student_info,'school/'+school_id+'/'+class_id+'/'+student_id+'/info.json');
    class_info.student[class_info.student.findIndex((element)=>element.id==student_id)].name = student_info.name;
    class_info.student[class_info.student.findIndex((element)=>element.id==student_id)].birthday = student_info.birthday;
    await uploadJSON(class_info,'school/'+school_id+'/'+class_id+'/info.json');
}

window.view_face_button_status = 0;
window.changeViewFaceStatus = ()=>{
    var viewFaceIcon = document.getElementById("view-face-icon");
    if (view_face_button_status==0) viewFaceIcon.setAttribute("class","fas fa-eye-slash");
    else viewFaceIcon.setAttribute("class","fas fa-eye");
    view_face_button_status ^= 1;
    loadStudentImage();
}

window.showPopUpFace = async (url)=>{
    const src =  await faceDetectURL(url); //container
    const modalBody = document.getElementById("modal-view-face-body");
    const href = document.createElement("a");
    href.setAttribute("href","javascript:void(0)");
    href.setAttribute("target","_blank");   
    const img = document.createElement("img");
	img.src = src;
    img.setAttribute("style","width:100%");
    fetch(src).then(res => res.blob()).then(
        blob => href.setAttribute("href",window.URL.createObjectURL(blob))
    );
    modalBody.innerHTML = "";
    href.append(img);
	modalBody.append(href);

    $('#modal-view-face').modal('show');
}