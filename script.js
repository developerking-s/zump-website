// script.js
const menuToggle = document.getElementById("mobile-menu");
const menu = document.querySelector(".menu");

menuToggle.addEventListener("click", () => {
  menu.classList.toggle("active");
});
