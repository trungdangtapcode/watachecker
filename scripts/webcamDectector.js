// import { initStorage } from "./firebase.js";

import { getStorage, ref, getDownloadURL, uploadBytes, listAll, deleteObject } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-storage.js";
import { storage } from "./firebase.js";
import { getDatabase, runTransaction } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js"

const least_image = 2;

//now still is undifined, wait to initChcker()
var container = document.querySelector('#container');
var fileInput = document.querySelector('#file-input');
var labels = [];
var webcamHeight, webcamWidth;
const id2Label = new Map();

async function loadTrainingData() {

	id2Label.clear();
	const faceDescriptors = []
	for (const element of labels) {
		const descriptors = []
		for (const url of element.url) {
			const image = await faceapi.fetchImage(url);
			const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
			if (detection) descriptors.push(detection.descriptor)
		}
		if (descriptors.length<least_image) continue;
		faceDescriptors.push(new faceapi.LabeledFaceDescriptors(element.id, descriptors));
		id2Label.set(element.id,element.label);
		Toastify({
			text: `Training xong data của ${element.label}! ( ${descriptors.length} ảnh khả thi)`
		}).showToast();
	}

	return faceDescriptors
}

let faceMatcher;
async function init() {
	await Promise.all([
		faceapi.loadSsdMobilenetv1Model('./models'),
		faceapi.loadFaceRecognitionModel('./models'),
		faceapi.loadFaceLandmarkModel('./models'),
		// faceapi.loadFaceExpressionNet('./models'),
	]);


	Toastify({
		text: "Tải xong model nhận diện!",
	}).showToast();

	console.error(labels);
	const trainingData = await loadTrainingData();
	if (labels.length==0){
		alert("lo roi do");
		alert(totalResponse);
	}
	faceMatcher = new faceapi.FaceMatcher(trainingData, 0.65)

	console.log(faceMatcher)
	document.querySelector("#loader-overlay").remove();
}

function until_faceMatcher(){
	const poll = (resolve,reject) =>{
		if (faceMatcher!=null) return resolve(); //or undefined
		else setTimeout(_ => poll(resolve,reject),400);
	}
	return new Promise(poll);
}

//now still is undifined, wait to initChcker()
var webcamVideo = document.getElementById('webcamVideo');
var webcamContainer = document.getElementById('webcamContainer');
async function check_face_video(){
	const canvas = faceapi.createCanvasFromMedia(webcamVideo);
	webcamContainer.append(canvas);
	const size = {width: webcamWidth*0+webcamVideo.offsetWidth, height: webcamHeight*0+webcamVideo.offsetHeight}
	faceapi.matchDimensions(canvas, size)

	var frame_count = 0;
	var face_frame_group = [];
	setInterval(async ()=>{
		const size = {width: webcamVideo.offsetWidth, height: webcamVideo.offsetHeight}
		const detections = await faceapi.detectAllFaces(webcamVideo).withFaceLandmarks().withFaceDescriptors()
		const resizedDetections = faceapi.resizeResults(detections, size)

		canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
		canvas.getContext('2d').rect(0,0,canvas.width,canvas.height);
		canvas.getContext('2d').stroke();
		for (const detection of resizedDetections) {
			const bestMatched = faceMatcher.findBestMatch(detection.descriptor)
			const drawBox = new faceapi.draw.DrawBox(detection.detection.box, {
				label: formatLabel(id2Label.get(bestMatched.label),bestMatched.distance)
			})
			drawBox.draw(canvas)
		}

		faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
		//faceapi.draw.drawDetections(canvas, resizedDetections)
		frame_count++;
		face_frame_group[frame_count%20] = resizedDetections.map((element)=> faceMatcher.findBestMatch(element.descriptor
			)).map((element) => element.label);
		if (frame_count>=20){
			const stableList = find_stable_face(face_frame_group);
			const checkerList = document.getElementById("checkerList");
			while (checkerList.rows[0]!=undefined) checkerList.deleteRow(0);
			const x = document.createElement("TBODY");
			for (const element of stableList){
				const y = document.createElement("TR");
				var label = document.createElement("TD");
				label.innerHTML = id2Label.get(element);
				var id = document.createElement("TD");
				id.innerHTML = element;
				y.appendChild(label);
				y.appendChild(id);
				x.appendChild(y);

				studentPresenceChecked(element);
			}
			checkerList.appendChild(x);
		};
	}, 50);
};

function find_stable_face(face_frame_group){
	var face_remain = face_frame_group[0];
	for (const face_frame of face_frame_group){
		face_remain = face_remain.filter(value => face_frame.includes(value));
	}
	return face_remain;
}

async function initWebcam(){
	const constraints = window.constraints = {
		audio: false,
		video: true
	};
	const stream = await navigator.mediaDevices.getUserMedia(constraints);
	const videoTracks = stream.getVideoTracks(); //cuoi cung cung dung den videoTrack :D
	webcamWidth = videoTracks[0].getSettings().width;
	webcamHeight = videoTracks[0].getSettings().height;
	webcamVideo.srcObject = stream;
}



async function check_face_file(){
	const files = fileInput.files;

	const image = await faceapi.bufferToImage(files[0]);
	//const image = document.getElementById('image-container-table');
	const canvas = faceapi.createCanvasFromMedia(image);

	container.innerHTML = ''
	container.append(image);
	container.append(canvas);

	const size = {
		width: image.width,
		height: image.height
	}

	faceapi.matchDimensions(canvas, size)

	const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
	const resizedDetections = faceapi.resizeResults(detections, size)

	//faceapi.draw.drawDetections(canvas, resizedDetections)

	for (const detection of resizedDetections) {
		const drawBox = new faceapi.draw.DrawBox(detection.detection.box, {
			label: faceMatcher.findBestMatch(detection.descriptor).toString()
		})
		drawBox.draw(canvas)
	}
};


export async function imageFaceDetect(image){
	const canvas = faceapi.createCanvasFromMedia(image);

	const container = document.createElement("div");
	container.setAttribute('id', 'container');
	container.append(image);
	container.append(canvas);

	const size = {
		width: image.width,
		height: image.height
	}

	faceapi.matchDimensions(canvas, size)

	const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
	const resizedDetections = faceapi.resizeResults(detections, size)

	for (const detection of resizedDetections) {
		const drawBox = new faceapi.draw.DrawBox(detection.detection.box, {
			label: faceMatcher.findBestMatch(detection.descriptor).toString()
		})
		console.log(faceMatcher.findBestMatch(detection.descriptor).toString());
		drawBox.draw(canvas)
	}
	
	return container;
}
window.faceDetectURL = async (url)=>{ //just detect face not recognite
	const image = await faceapi.fetchImage(url);
	await Promise.all([
		faceapi.loadSsdMobilenetv1Model('./models'),
		faceapi.loadFaceLandmarkModel('./models'),
	]);
	const canvas = faceapi.createCanvasFromMedia(image);

	const size = {
		width: image.width,
		height: image.height
	}

	const detections = await faceapi.detectSingleFace(image).withFaceLandmarks()
	if (detections){
		const resizedDetections = faceapi.resizeResults(detections, size)
		faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
	}

	return canvas.toDataURL();
}

export async function initChecker(){
	container = document.querySelector('#container');
	fileInput = document.querySelector('#file-input');
	webcamVideo = document.getElementById('webcamVideo');
	webcamContainer = document.getElementById('webcamContainer');
	await loadLabels();
	await init();
	initWebcam();
	webcamVideo.addEventListener('play', ()=>{
		check_face_video();
	});
	fileInput.addEventListener('change', ()=>{
		check_face_file();
	});
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
									
									var new_label = {};
									new_label["label"] = element.name + " [" + className + "]";
									new_label["id"] = element.id;	
									new_label["url"] = [];
									for (const image of student_info.image){
										//IMAGE:
										const pathReference = ref(storage,studentPath+image.idName);
										await getDownloadURL(pathReference).then((url) =>{
											new_label["url"].push(url);
										});
									}
									totalResponse++;
									if (student_info.image.length<least_image) return;
									labels.push(new_label);
								});
							})});
						}
						totalResponse++;
					});
				})});
			}
			totalResponse++;
		});
	})});
}
function until_responsedAllLabels(){
	const poll = (resolve,reject) =>{
		console.log(totalRequest,totalResponse);
		if (totalRequest==totalResponse) resolve();
		else setTimeout(_ => poll(resolve,reject),400);
	}
	return new Promise(poll);
}
async function loadLabels(){
	totalRequest = totalResponse = 0;
	loadLabels_student_info();
	await until_responsedAllLabels();
}

// fileInput.addEventListener('change', ()=>{
// 	check_face_file();
// });
