

const uid = "8a5ef4d517ef1a5d4d7d467f6ecfe6823e313ef81cca8b1541aa55f341c83728";
const secret = "91bbcaca204bc2b7532ed4d597c6fddea93d364d9344ac193e42a21f49bc49d7";
const redirectUrl = "https://42apitesting.netlify.app";
let accessToken;
let refreshToken;
let tokenType;

function AuthentificationTheUser() {
    location.href = "https://api.intra.42.fr/oauth/authorize?client_id=8a5ef4d517ef1a5d4d7d467f6ecfe6823e313ef81cca8b1541aa55f341c83728&redirect_uri=https%3A%2F%2F42apitesting.netlify.app&response_type=code";
};

const loginButton = document.querySelector("#login");
loginButton.addEventListener('click', () => {
    AuthentificationTheUser();
    localStorage.setItem('alreadyLogin', 'true');
});
let code = location.search.substring(6);

async function getTokens() {

    let response = await fetch('https://api.intra.42.fr/oauth/token', {
        method: 'POST',
        body: 'grant_type=authorization_code&client_id=' + uid + '&client_secret=' + secret +
            '&code=' + code +
            '&redirect_uri='+ redirectUrl,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    if (response.status === 200) {
        let data = await response.json();
        accessToken = data.access_token;
        refreshToken = data.refresh_token;
        tokenType = data.token_type;
        console.log("token", accessToken);
    }
    else if (response.status === 401) {
        AuthentificationTheUser();
        code = location.search.substring(6);
    }
    else {
        // display login button if invalid request
        console.log("error");
    }

}

async function getUserData() {

    let response = await fetch('https://api.intra.42.fr/v2/me', {
        headers: {
            'Authorization': tokenType + ' ' + accessToken,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    let userData = await response.json();
    if (userData) {
        console.dir(userData);
        const firstName = userData.first_name;
        const lastName = userData.last_name;
        console.log(firstName, lastName);
    }
}
// https://api.intra.42.fr/v2/cursus/21/cursus_users?filtre[created_at]=2020-11-11T09:57:18.084Z&filter[campus_id]=16&range[begin_at]=2019-10-16T00:00:00.000Z,2019-10-17T00:00:00.000Z&page=$pageNumber&per_page=2'

async function getUsers() {
    let response = await fetch('https://api.intra.42.fr/v2/cursus/21/cursus_users?filtre[created_at]=2020-11-11T09:57:18.084Z&filter[campus_id]=16&range[begin_at]=2019-10-16T00:00:00.000Z,2019-10-17T00:00:00.000Z&page=$pageNumber&per_page=100', {
        headers: {
            'Authorization': tokenType + ' ' + accessToken,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    let allUsers = await response.json();
    console.log(allUsers);
    allUsers.sort((a, b) => {
        return (b.level - a.level);
    })
    let i = 1;
    allUsers.forEach(user => {
       // console.log(user);
        const allUsersDive = document.querySelector('#all-users');
        const card = document.querySelector('.user');
        const clone = card.cloneNode(true);
      //  console.dir(clone);
        clone.classList.remove('hide');
        const content = clone.childNodes[1].childNodes[1].childNodes[1].childNodes;
        //console.log("content", content[1], content[3]);
        const userImage = content[1].childNodes[1];
        const userName = content[3].childNodes[1];
        const userLevel = content[3].childNodes[3].childNodes[1];
        const sort = content[3].childNodes[5];
        sort.innerHTML = `${i}`;
        userImage.src = `https://cdn.intra.42.fr/users/${user.user.login}.jpg`;
        userName.innerHTML = `${user.user.login}`;
        userLevel.innerHTML = `${user.level}`.slice(0,4);
        i++;
        allUsersDive.append(clone);
        //  console.log(user.user.login , user.level);
    });
};
const alreadyLogin = localStorage.getItem('alreadyLogin');

if (alreadyLogin) {
    console.log("login", login);
    console.log('code :', code);
    // get access token and refresh token
    getTokens()
        .then(getUsers)
        .catch(error => {
            console.log(error);
        });
}
else {
    console.log("login", login);
    loginButton.classList.remove("hide");
}
