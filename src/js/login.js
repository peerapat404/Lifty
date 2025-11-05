const loginEmailInt = document.querySelector('#loginEmail');
const loginPasswordInt = document.querySelector('#loginPassword');
const loginBtn = document.querySelector('#loginBtn');

let users = [];

if (localStorage.getItem('users') != null) {
    users = JSON.parse(localStorage.getItem("users"));
}

function login() {
    let loginEmail = loginEmailInt.value;
    let loginPassword = loginPasswordInt.value;

    if (loginEmailInt.value === "" || loginPasswordInt.value === "") {
        alert("Please field in all fieds");
    }

    if (isCorrectEmailAndPassword(loginEmail, loginPassword)) {
        window.location.href = "home.html";
    } else {
        alert("Your email or password is incorrect");
    }
}

loginBtn.addEventListener('click', login);

function isCorrectEmailAndPassword(email, password) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].email === email && users[i].password === password) {
            localStorage.setItem("username", users[i].username) 
            return true;
        }
    }
    return false;
}