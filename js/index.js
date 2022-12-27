// in this function we are setting the cookie with the name, value and expiry date
// we are also setting the path to the root of the website
// we are also setting the message to be empty
function set_cookie(cookie_name, cookie_value, expiration_days) { 
    const date_value = new Date();
    date_value.setTime(date_value.getTime() + (expiration_days*24*60*60*1000));
    let expires_at = "expires="+ date_value.toUTCString();
    document.cookie = cookie_name + "=" + cookie_value + ";" + expires_at + ";path=/";
    document.getElementById("message").innerHTML = "";
}
// in this function we are getting the cookie with the name
// we are also setting the message to be empty
// we are also returning the cookie value if found
function get_from_cookie(cookie_name) {
    let c_name = cookie_name + "=";
    let decoded_cookie = decodeURIComponent(document.cookie);
    let cookie_parts = decoded_cookie.split(';');
    cookie_parts.forEach(cookie_part => {
        while (cookie_part.charAt(0) == ' ') {
            cookie_part = cookie_part.substring(1);
        }
        if (cookie_part.indexOf(c_name) == 0) {
            return cookie_part.substring(c_name.length, c.length);
        }
    });
    return "";
}
// بخش امتیازی ۱ - save data to local storage
// in this function we are saving the data to the local storage
function set_to_localStorage(username, data){
    localStorage.setItem(username, data);
}
// in this function we are getting the data from the local storage
function get_from_localStorage(username){
    return localStorage.getItem(username);;
}
///////////////////////////////////////////////////////////
// in this function we are getting the user info from the github api if the user is not found in the local storage
async function getUserInfo(){
    let username = document.getElementById("username").value
    let s_data = null;
    let data = null;
    if (localStorage.getItem(username) != null) {// if we have the data in the local storage we are loading it
        s_data = get_from_localStorage(username);
        data = JSON.parse(s_data);
        document.getElementById("message").innerHTML = "Data Loaded from Local Storage";
    } else if (get_from_cookie(username) != "") { // if we have the data in the cookies we are loading it
        s_data = get_from_cookie(username);
        data = JSON.parse(s_data);
        document.getElementById("message").innerHTML = "Data Loaded from Cookies";
    } else {
        console.log(get_from_cookie(username) == "");
        let response = await fetch(`https://api.github.com/users/${username}`);
        data = await response.json();
        s_data = JSON.stringify(data);
        document.getElementById("message").innerHTML = "";
    }
    set_to_localStorage(username, s_data);
    set_cookie(username, s_data, 1);
    if (data.message) {
        document.getElementById("output-box").style.opacity = 0.35;
        document.getElementById("message").innerHTML = "Username Not Found";
    } else {
        if (document.getElementById("message").innerHTML == "Username Not Found"){
            document.getElementById("message").innerHTML = "";
        }
        // set the data to the html elements
        document.getElementById("output-box").style.opacity = 1;
        if (data.avatar_url) {document.getElementById("avatar-img").src = data.avatar_url ;}
        if (data.name) {document.getElementById("account-name").innerHTML = data.name} else {document.getElementById("account-name").innerHTML = "unknown"}
        if (data.bio) {document.getElementById("bio").innerHTML = data.bio;} else {document.getElementById("bio").innerHTML = "No Bio"}
        if (data.blog) {document.getElementById("blog").innerHTML = "blog: " + data.blog.replace('https://','www.');} else {document.getElementById("blog").innerHTML = "No Blog"}
        if (data.location) {document.getElementById("loc").innerHTML = data.location} else {document.getElementById("loc").innerHTML = "location not specified"}
        if (data.followers) {document.getElementById("followers").innerHTML = data.followers} else {document.getElementById("followers").innerHTML = "unknown"}
        if (data.following) {document.getElementById("following").innerHTML = data.following} else {document.getElementById("following").innerHTML = "unknown"}
    }
    if (data.repos_url) { // if the user has repos we are getting the favorite language
        const response = fetch(data.repos_url);
        response
        .then((response) => response.json())
        .then((repos) => {
            let favorite_language = get_favorite_language(repos);
            if (favorite_language) {
                document.getElementById("fav_lang").innerHTML = favorite_language;
            } else {
                document.getElementById("fav_lang").innerHTML = 'No Specific Language as Favorite';
            }
        });
    }
}

function get_favorite_language(repos) { // this function is getting the favorite language of the user
    let languages = [];
    for (let index = 0;  index < 5; index++){
        let repo = repos[index];
        if (repo.language) {
            languages.push(repo.language);
        }
    }
    let languages_count = {};
    languages.forEach(function(i) {
         languages_count[i] = (languages_count[i]||0) + 1;
        }
    );
    let max_count_language = 0;
    let favorite_language = null;
    for (lang in languages_count) { // finding the most used language
        if (languages_count[lang] > max_count_language) {
            max_count_language = languages_count[lang];
            favorite_language = lang;
        }
    }
    return favorite_language;
}

// بخش امتیازی ۲ - handle offline/online events
window.addEventListener("offline", function() {
    document.getElementById("message").innerHTML = "Network Error";
})
window.addEventListener("online", function() {
    if (document.getElementById("message").innerHTML == "Error in Internet Connection") {
        document.getElementById("message").innerHTML = "";
    }
               
})