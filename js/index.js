let ipipBtn = document.querySelector("#btn-ipip");
let crtBtn = document.querySelector("#btn-crt");
let dassBtn = document.querySelector("#btn-dass");

ipipBtn.addEventListener("click", () => {
  window.location.href = "tests/ipip_test.html";
});

crtBtn.addEventListener("click", () => {
  window.location.href = "tests/crt_test.html";
});

dassBtn.addEventListener("click", () => {
  window.location.href = "tests/dass_test.html";
});
