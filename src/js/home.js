let welcomeUser = document.querySelector('#username');
console.log(welcomeUser);

let user = localStorage.getItem("username");

welcomeUser.textContent = `Welcome ${user}`;

