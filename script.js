registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    fullname: fullname.value,
    phone: phone.value,
    email: email.value,
    course: course.value,
    department: department.value,
    nationality: nationality.value,
    photo: canvas.toDataURL("image/png")
  };

  const res = await fetch("http://localhost:5000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (result.success) {
    document.getElementById("formMsg").textContent =
      "Registration successful!";
  } else {
    document.getElementById("formMsg").textContent =
      "Something went wrong!";
  }

  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
});
