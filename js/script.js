var video = document.querySelector('.js-video');
var canvas = document.querySelector('.js-overlay');
var emotionText = document.querySelector('.js-emotion');
var genderText = document.querySelector('.js-gender');
var ageText = document.querySelector('.js-age');

var displaySize = { width: video.width, height: video.height};

const emotions = {
	'neutral': 'Нейтральний 😐',
	'surprised': 'Здивована 😮',
	'disgusted': 'Не подобається щось 😒',
	'fearful': 'Наляканий 😨',
	'sad': 'Засмучений 🙁',
	'angry': 'Злий 😠',
	'happy': 'Веселий 😃',
}

function startVideo(){
    navigator.getUserMedia({video:true}, 
        (stream) => {
            video.srcObject = stream;
        }, (err) => console.error(err)
    );
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    faceapi.nets.ageGenderNet.loadFromUri("/models")
]).then(startVideo);

function showExpression({ expressions }) {
	const arr = Object.entries(expressions);
	const max = arr.reduce((acc, current) => {
		return acc[1] > current[1] ? acc : current;
	}, [])
	emotionText.textContent = emotions[max[0]];
}

function showAge({age}){
    ageText.textContent = 'Вік: ' +  Math.round(age);
}

function showGender({gender}){
    genderText.textContent = 'Стать: ' + (gender === 'male' ? 'Чоловік' : 'Жінка');
}

async function detectFace() {
    const options = new faceapi.TinyFaceDetectorOptions();
 
	faceapi.matchDimensions(canvas, displaySize);

	setInterval(async () => {

       const detects = await faceapi.detectSingleFace(video,options)
       .withFaceLandmarks()
       .withFaceExpressions()
       .withAgeAndGender();

       console.log(detects);
        const resizedDetections = faceapi.resizeResults(detects, displaySize);
		canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
		faceapi.draw.drawDetections(canvas, resizedDetections);
		
		if (detects) {
            showExpression(detects);
            showAge(detects);
            showGender(detects);
        }
        
	}, 800);
}

video.addEventListener('play', detectFace);
