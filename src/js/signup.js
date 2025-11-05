const usernameInt = document.querySelector('#signupUsername');
const signupEmailInt = document.querySelector('#signupEmail');
const signupPasswordInt = document.querySelector('#signupPassword');
const signupBtn = document.querySelector('#signupBtn');

let users = [];

function signUp() {
    let user = {
        username: usernameInt.value,
        email: signupEmailInt.value,
        password: signupPasswordInt.value, 
    };

    if (usernameInt.value === "" ||
        signupEmailInt.value === "" ||
        signupPasswordInt.value === ""
    ) {
        alert('Please fill in all fields');
    }

    if(
        isValidEmail(signupEmailInt.value) && 
        isNewEmail(signupEmailInt.value)) {
            users.push(user);
            localStorage.setItem("users", JSON.stringify(users));
            clearForm();
            console.log(users);
        }
}

signupBtn.addEventListener('click', signUp);

function isValidEmail(email) {
    let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

function isNewEmail(email) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].email === email) {
            return false;
        }
    }
    return true;
}

function clearForm() {
    usernameInt.value = "";
    signupEmailInt.value = "";
    signupPasswordInt.value = "";
}