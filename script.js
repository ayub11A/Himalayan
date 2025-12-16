const showFormBtn = document.getElementById('showFormBtn');
const registerForm = document.getElementById('registerForm');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');

let stream;

// Show form + start camera
showFormBtn.addEventListener('click', async () => {
  registerForm.style.display = 'block';

  try {
    if (!stream) {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;

      await new Promise(resolve => video.onloadedmetadata = resolve);

      // Capture initial photo
      capturePhoto();
    } else {
      capturePhoto();
    }
  } catch (err) {
    console.error("Camera access denied:", err);
  }
});

// Capture photo function
function capturePhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  photo.src = canvas.toDataURL('image/png');
}

// Form submission (client-side demo)
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const fullname = document.getElementById('fullname').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  const course = document.getElementById('course').value;
  const department = document.getElementById('department').value;
  const nationality = document.getElementById('nationality').value;

  const photoData = canvas.toDataURL('image/png');

  document.getElementById('formMsg').textContent =
    `Thank you ${fullname}, we 'll send you a message to your email!`;

  console.log({ fullname, phone, email, course, department, nationality, photoData });

  // Stop camera
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
});
