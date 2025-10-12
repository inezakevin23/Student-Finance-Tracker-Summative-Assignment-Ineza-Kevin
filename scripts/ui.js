// import records from "./state";


document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  menuBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    menuBtn.classList.toggle('open');
    navMenu.classList.toggle('open');
  });

  // Close menu when clicking a link
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function() {
      menuBtn.classList.remove('open');
      navMenu.classList.remove('open');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!menuBtn.contains(e.target) && !navMenu.contains(e.target)) {
      menuBtn.classList.remove('open');
      navMenu.classList.remove('open');
    }
  });
});