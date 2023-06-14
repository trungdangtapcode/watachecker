function downloadImage(url) {
    fetch(url, {
      mode : 'no-cors',
    })
      .then(response => response.blob())
      .then(blob => {
      let blobUrl = window.URL.createObjectURL(blob);
      console.log(blobUrl);
      //document.body.appendChild(a);
    })
}

// const cors = require('cors')({origin: true});

// exports.sample = functions.https.onRequest((req, res) => {
//   cors(req, res, () => {
//     res.send('Passed.');
//   });
// });


<button id="test_button-change-page">File change</button>
const test_change_button = document.getElementById('test_button-change-page');
test_change_button.addEventListener('click', async () =>{
    //window.history.pushState('data to be passed', 'Title of the page', 'test');
    var xhr= new XMLHttpRequest();
    xhr.open('GET', '../htmls/file_manager_index.html', true);
    xhr.onreadystatechange= function() {
        if (this.readyState!==4) return;
        if (this.status!==200) return; // or whatever error handling you want
        document.body.innerHTML= this.responseText;
    };
    xhr.send();
})


async function getSchoolInfo(id){
  const ref_info = 'school/'+id+'/info.json';
  const pathReference = await ref(storage, ref_info);
  getDownloadURL(pathReference).then(async (url) =>{ 
      // console.log(url);
      // const response = await fetch(url);
      // const data = await response.json();
      // console.log(response);
      getJSON(url, function(status, data){
          // console.log(JSON.parse(data));  
          // var b = new Blob([JSON.stringify({"test": "toast"})], {type : "application/json"});
          // data.onload = function() {
          //     console.log(JSON.parse(data))
          // };
          // data.readAsText(b);
          var file = new File([data], "json", { type: data.type});
          console.log(file);
          // console.log(file.stream());
          const fr = new FileReader();
          fr.readAsText(file);
          fr.addEventListener('load', ()=>{
              const res = fr.result;
              console.log(res);
              console.log(JSON.parse(res))
          });
      });
  });
  console.log(id);
}

export async function getDataRequest(url){
  const xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.onload = (event) => {
      const blob = xhr.response;
      console.log(blob);
      return blob;
  };
  xhr.open('GET', url);
  xhr.send();
}

// while (classTable.hasChildNodes()) classTable.removeChild(classTable.firstChild)

async function checkNewClassNameAvailable(name){
  await school_info.class.forEach((element) =>{
      if (element.name == name){
          alert("Tên lớp này đã có rồi!");
          return false;
      }
  });
  return true;
};

async function checkNewClassNameAvailable(name){
  (async ()=> {
      for (const element of school_info){
          console.log(element.name);
          if (element.name == name){
              alert("Tên lớp này đã có rồi!");
              return false;
          }
      };
  });
  console.log('toi day la hay roi ditconmemay');
};


        var name = document.createElement("TD"); 
        var name_href = document.createElement("button"); 
        name_href.innerHTML = element.name;
        name.innerHTML = name_href.outerHTML;

        var members = document.createElement("TD");
        var members_href = document.createElement("button");
        members_href.innerHTML = element.members;
        members.innerHTML = members_href.outerHTML;

window.test_del = async ()=>{
    const desertRef = ref(storage, 'school/'+school_id+'/20eb3243-c84f-4e01-84bf-a2019758da4d');
    deleteObject
}

x.setAttribute("href","window.open('"+url+"','_blank')");

webcamVideo.addEventListener('play', async () => {
  
})

fileInput.addEventListener('change', async () => {

});

// init();
// initWebcam();

async function loadTrainingData() {
	const labels = ['Fukada Eimi', 'Rina Ishihara', 'Takizawa Laura', 'Yua Mikami', 'Trung']

	const faceDescriptors = []
	for (const label of labels) {
		const descriptors = []
		for (let i = 1; i <= 4; i++) {
			const image = await faceapi.fetchImage(`/data/${label}/${i}.jpeg`)
			const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
			descriptors.push(detection.descriptor)
		}
		faceDescriptors.push(new faceapi.LabeledFaceDescriptors(label, descriptors))
		Toastify({
			text: `Training xong data của ${label}!`
		}).showToast();
	}

	return faceDescriptors
}

function loadLabels(){
	loadLabels_student_info();
}


//CALLBACK HELL :D. #j4f => co ham gon hon o firebase.js (getJSON())
var totalRequest, totalResponse;
function loadLabels_student_info(){
	totalRequest++;
	//SCHOOL:
	const pathReference = ref(storage,'school/'+school_id+'/info.json');
	getDownloadURL(pathReference).then((url)=>{ getBlob(url, (status, blob)=>{
		var file = new File([blob], "name", { type: blob.type});
		const fr = new FileReader();
		fr.readAsText(file);
		fr.addEventListener('load', ()=>{
			const res = fr.result;
			const school_info = JSON.parse(res);
			totalRequest += school_info.class.length;
			for (const element of school_info.class){
				//CLASS:
				const pathReference = ref(storage,'school/'+school_id+'/'+element.id+'/info.json');
				const classPath = 'school/'+school_id+'/'+element.id+'/';
				const className = element.name;
				getDownloadURL(pathReference).then((url)=>{ getBlob(url, (status, blob)=>{
					var file = new File([blob], "name", { type: blob.type});
					const fr = new FileReader();
					fr.readAsText(file);
					fr.addEventListener('load', ()=>{
						const res = fr.result;
						const class_info = JSON.parse(res);
						totalRequest += class_info.student.length;
						for (const element of class_info.student){
							//STUDENT:
							const pathReference = ref(storage,classPath+element.id+'/info.json');
							const studentPath = classPath + element.id + '/';
							getDownloadURL(pathReference).then((url)=>{ getBlob(url, (status, blob)=>{
								var file = new File([blob], "name", { type: blob.type});
								const fr = new FileReader();
								fr.readAsText(file);
								fr.addEventListener('load', async ()=>{
									const res = fr.result;
									const student_info = JSON.parse(res);	
									if (student_info.image.length<2) return;
									
									var new_label = {};
									new_label["label"] = element.name + "[" + className + "]";	
									new_label["url"] = [];
									for (const image of student_info.image){
										//IMAGE:
										const pathReference = ref(storage,studentPath+image.idName);
										await getDownloadURL(pathReference).then((url) =>{
											new_label["url"].push(url);
										});
									}
									labels.push(new_label);
								});
								totalResponse++;
							})});
						}
					});
					totalResponse++;
				})});
			}
		});
		totalResponse++;
	})});
}

new_label["label"] = element.name + "[" + className + "]";	


//labels nhung that ra la ID phai dung Map de lay label tranh bi trung
//attribute label that ra la id de xac thuc sau do moi dung id2Label chuyen sang label that


        // console.log(snapshot.toString());
        // snapshot.val()["ccbm"] = "hiii";
        // return snapshot;

    // get(child(databaseRef(db),'students')).then((snapshot) => {
    //     console.log(snapshot.val());
    // })

x.innerHTML = getPresenceStatus(studentElement.id, previousDate(today,today.getDate()-index-1)).outerHTML;
if (index+1>today.getDate){}

function getPresenceStatus(id,date){
  var icon = document.createElement("i");
  icon.setAttribute("class","bx bxs-circle");
  if (presenceJSON[id]&&presenceJSON[id][dateToNum(date)]){
      const tmp = new Date(date.getTime());
      tmp.setHours(6);
      tmp.setMinutes(45);
      if (date<=tmp){
          icon.setAttribute("style","color:MediumSeaGreen");
      } else icon.setAttribute("style","color:Tomato");
  } else icon.setAttribute("style","color:Maroon");
  return icon;
}

href.setAttribute("href","javascript:void(0);"); //in showStudentImage()

if (index+1>today.getDay()){
  x.innerHTML = "<i class='bx bxs-circle' style='color:Gray;'></i>";
  studentRow.appendChild(x);
//  continue;    
};



async function initStorage(){
    
  const auth = getAuth(app);
  const email = "trungdeptrai@gmail.com";
  userCredential = await signInWithEmailAndPassword(auth, email, email);
  // signInWithEmailAndPassword(auth, email, email)
  // .then((userCredential) => {
  // })
  // .catch((error) => {
  //     alert(error);
  // });
}

initStorage();


window.nham1 = async (x)=>{
  console.log(class_info);
  class_info.members = x;
  await uploadJSON(class_info,'school/'+school_id+'/'+class_id+'/info.json');
  school_info.class[school_info.class.findIndex((element)=>element.id==class_id)].members = x;
  await uploadJSON(school_info,'school/'+school_id+'/info.json');
}

get(databaseRef(db,'/users/'+user.uid)).then(async (snapshot)=>{
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

// console.log(username,firstname,lastname,orgname,location,email,phone,birthday);
console.log(user_info);
console.log(profileUsername);

import { user_info } from "./login_signup.js";

function updateIfNotEmpty(a, b){
  if (b&&b!="") a = b;
}

//updateIfNotEmpty(user_info.birthday,dateToDateInputFormat(new Date(profileBirthday)));

//eimi vao ngay thu 5
if (date.getDay()==4&&id=="3eb9ebca-7fc0-4f17-b0ab-14efb94a2a94") console.log(new Date(presenceJSON[id][dateToNum(date)]),tmp);

webcamVideo.play() //lo vllll

console.log(user_info,profileBirthday,dateToDateInputFormat(new Date(profileBirthday)));

divfile.innerHTML = href.outerHTML;


var view_face_button_div = document.createElement("div");
view_face_button_div.setAttribute("class","hover");
view_face_button_div.setAttribute("style","position: absolute; left:5%;");
var view_face_button = document.createElement("button");
view_face_button.setAttribute("type","button");
view_face_button.setAttribute("class","btn btn-icon btn-info");
view_face_button.setAttribute("onclick","alert()");
var view_face_icon = document.createElement("i");
view_face_icon.setAttribute("class","fas fa-eye");
view_face_button.innerHTML = view_face_icon.outerHTML;
view_face_button_div.innerHTML = view_face_button.outerHTML;

document.body.append(container);
var newWindow = window.open("", "", "width=500,height=400");
newWindow.document.body.append(container);
// var x = document.createElement("image");
// x.setAttribute("src",canvas.toDataURL("image/png"));
// document.body.append(x);
// return await imageFaceDetect(image);

//canvas.getContext('2d')

const img = document.createElement("img");
img.src = canvas.toDataURL();
const modalBody = document.getElementById("modal-view-face-body");
modalBody.append(img);

console.log(window.URL.createObjectURL(new Blob(src, {type: "image/jpeg"})));