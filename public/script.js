const server = "https://salty-basin-23693.herokuapp.com"//change based on deployment to:"http://localhost:3000"; || https://salty-basin-23693.herokuapp.com";
let user = {};

//called on index page load, or when a user logs out
function loadFrontPage() {    
    const $mainDiv = $("#mainDiv");
    $mainDiv.empty();
    //build HTML for front page content
    const $frontPageContent = $(`
        <div class="centerDiv"><H1>Welcome to Meal MVP</H1></div>
        <div class="roundedContainerNoHover">
        <div><p>Username:<input id="username"></p></div>
        <div><p>Password:<input id="pword"></p></div>
        <div><button id="login" type="submit">Login</button></div>
        <div><p id="nUser">New Users</p></div></div>
        `);
    $frontPageContent.appendTo($mainDiv);
    $("#login").click(loadRecipePage);
    $("#pword").keypress(function (event) {
        if (event.key == "Enter") {
            loadRecipePage();
        }
    })
    $("#nUser").click(newUserFormLoad);
}
loadFrontPage();//initialize login page
function logout(){
    user = {};
    loadFrontPage();
}
//called when user clicks login button
async function loadRecipePage() {
    let name = "";
    let password = "";
    if (Object.keys(user).length <= 1) {
        let $username = $('#username');
        name = $username.val()
        let $password = $('#pword');
        password = $password.val()
    } else {
        name = user.name;
        password = user.password;
    }
    user = await checkUser(name, password)//returns user object with validated boolean key value pair
    console.log(user);
    const $mainDiv = $("#mainDiv");
    $mainDiv.empty();
    if (user.validated) {//correct username and password
        //build HTML for top of recipe/search page
        const $recipePageContent = $(`
            <div class="leftDiv"><div id="logout"><button>logout</button></div></div><div class="rightDiv"><div id="pwordRset"><button id="reset">reset password</button></div></div>
            <div class="centerDiv"><H3>${user.name}'s favorite Meals</H3></div>
            <div class="roundedContainerNoHover">
            <div><p>Recipe Search:<input id="recipeSearch">
            <button id="search" type="button">Search</button></p></div>            
        `);
        $recipePageContent.appendTo($mainDiv);//append HTML to the main div
        $('#logout').click(logout);//listener
        $('#reset').click(pwordReset);
        let $search = $("#search");
        $('#recipeSearch').keypress(function (event) {//listener for enter press
            if (event.key == "Enter") {
                loadSearchResults($("#recipeSearch").val());
            }
        })
        $search.click(function () {//listener for search button click
            loadSearchResults($("#recipeSearch").val());
        });
        //builds the list of recipes that the user has added as favorites and appends to main div
        const favorites = user.favorites;//array of users favorite recipes, each recipe stored as an object        
        for (let i = 0; i < favorites.length; i++) {
            let currentFavorite = favorites[i];//get current favorite recipe object
            const $appendDiv = $(`
            <div class="leftroundedContainer"  id="${currentFavorite.meal_id}">            
            <div class="leftimg"><img id="${i}image" src="${currentFavorite.image_url}"></div>
            <div class="horizontal"><h5 id="${i}name">${currentFavorite.name}</h5>
            <p id="${i}ingredient_list">${currentFavorite.ingredient_list}</p></div>
            </div>
            `);
            $appendDiv.appendTo($mainDiv);//append rounded container div with recipe info to the main div
            $(`#${currentFavorite.meal_id}`).click(removeFav);//listener for favorite meal div click event calls function
        }
    } else {//if the user came back as not validated sends back to front page
        let modal = document.getElementById("myModal");// Get the modal
        let p = document.getElementById("modalText");//get the paragraph inside the modal
        p.innerHTML = 'Incorrect Login   <button id="close">OK</button>'//insert HTML in the paragraph for this message event
        modal.style.display = "block";//open the modal
        $('#close').click(function () {//when ok is clicked empty the modal and stop displaying
            p.innerHTML = ""
            modal.style.display = "none";
            loadFrontPage();           //re-load the login page
        })
    }
}
//function returns a user object that has a favorites list and a validation boolean
async function checkUser(n, p) {
    let response = await fetch(`${server}/user`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: `${n}`, password: `${p}` })
    });
    let retUser = await response.json();
    return retUser;
}
//resets user password on button click
async function pwordReset() {
    let modal = document.getElementById("myModal");// Get the modal
    let p = document.getElementById("modalText");//get the paragraph inside the modal
    p.innerHTML = 'Reset your password    <input id="password"> <button id="close">OK</button>'//insert HTML in the paragraph for this message event
    modal.style.display = "block";//open the modal
    $('#close').click(function () {//when ok is clicked empty the modal and stop displaying
        
        if(passwordPatch($('#password').val())){//send the password to the function
            p.innerHTML = 'Password reset successful!         <button id="close">OK</button>'
            $('#close').click(function () {
                p.innerHTML = ""
                modal.style.display = "none";
            });
        }else{
            p.innerHTML = 'ERROR: Password reset not successful         <button id="close">OK</button>'
        }
        
    })
}

async function passwordPatch(str){
    let response = await fetch(`${server}/password`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: `${str}`, user_id: `${user.user_id}` })
    });
    let data = await response.json();
    return true;
}
//called when user clicks search button
async function loadSearchResults(str) {
    //calls to edam api through our api server loads the results into the Main Div after clearing
    const $mainDiv = $("#mainDiv");
    const $searchPageContent = $(`
    <div class="leftDiv"><div id="logout"><button>logout</button></div></div><div class="rightDiv"><div id="pwordRset"><button id="reset">reset password</button></div></div>
        <div class="centerDiv"><H3>${user.name} search results</H3></div>
        <div class="roundedContainerNoHover">
        <div><p>Recipe Search:<input id="recipeSearch">
        <button id="search" type="button">Search</button>
        <button id="favorites" type="button">Return to Favorites</button></p>
        </div>
        `);
    $mainDiv.empty();//clear previous content to load fresh content
    $searchPageContent.appendTo($mainDiv);
    $('#logout').click(logout);//click event for logout
    $('#reset').click(pwordReset);//click event to reset password
    $('#recipeSearch').keypress(function (event) {//search when return is pressed
        if (event.key == "Enter") {
            loadSearchResults($("#recipeSearch").val());
        }
    })
    let $favorites = $("#favorites");
    $favorites.click(function () {//click event for return to favorites button
        loadRecipePage();           //re-loads users favorites page
    });
    let $search = $("#search");
    $search.click(function () {//click event for search button
        loadSearchResults($("#recipeSearch").val());
    });
    let data = await getSearchData(str);
    //console.log(data);
    for (let i = 0; i < data.length; i++) {//fills main div with recipes based on returned search data
        let currentMeal = data[i];//get current favorite recipe object
        const $appendDiv = $(`
        <div class="leftroundedContainer" id="${i}">
        <div class="leftimg"><img id="${i}image" src="${currentMeal.image_url}"></div>
        <div class="horizontal"><h5 id="${i}name">${currentMeal.name}</h5>
        <p id="${i}ingredient_list">${currentMeal.ingredient_list}</p></div>
        </div>`);
        $appendDiv.appendTo($mainDiv);//append rounded container div with recipe info to the main div
        $(`#${i}`).click(saveFav);//add click event listener to rounded container to save the recipe
    }
}
//called by load searc results function returns data from external API edamam
async function getSearchData(str) {
    let response = await fetch(`${server}/search/${str}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    let data = await response.json()
    //console.log(data);
    return data;
}
//prompt user yes no, save to database if yes
async function saveFav(ev) {
    let meal_id = ev.currentTarget.id;
    let modal = document.getElementById("myModal");// Get the modal
    let p = document.getElementById("modalText"); //Get the paragraph for content inside the modal
    p.innerHTML = 'Save this recipe to favorites?<button id="save">Yes</button><button id="close">No</button>'
    modal.style.display = "block";//open the modal
    $yesBtn = $('#save');
    $noBtn = $('#close');
    $yesBtn.click(function () {//if yes button is clicked 
        let id = ev.currentTarget.id;
        let nameH = document.getElementById(`${id}name`); //get recipe name tag
        let imgTag = document.getElementById(`${id}image`); //get recipe image tag
        let ingredientsP = document.getElementById(`${id}ingredient_list`); //get recipe ingredients tag
        let name = nameH.textContent; //get textcontent from recipe name
        let image_url = imgTag.src; //get src of image tag
        let ingredient_list = ingredientsP.innerHTML; //get textcontent from ingredients tag        
        if (storeFavorite(name, image_url, ingredient_list)) { //pass the values into an async function to store in database
            p.innerHTML = ""
            modal.style.display = "none";
        }
    })
    $noBtn.click(function () {//if no button is clicked close the modal and empty the text content
        p.innerHTML = ""
        modal.style.display = "none";
    })
}
//prompts if user wants to and deletes a favorite
async function removeFav(ev) {
    let meal_id = ev.currentTarget.id;
    let modal = document.getElementById("myModal");// Get the modal    
    let p = document.getElementById("modalText");
    p.innerHTML = 'remove recipe from favorites?    <button id="Delete">Yes</button><button id="close">No</button>'
    modal.style.display = "block";//open the modal
    $('#Delete').click(function () {//yes button clicked clear and close the modal and delete the favorite
        p.innerHTML = ""
        modal.style.display = "none";
        deleteFavorite(meal_id);//call async function to delete record
    })
    $('#close').click(function () {//if user clicks no clear and close the modal
        p.innerHTML = ""
        modal.style.display = "none";
    })
}
//async function to send the favorite recipe data to the api server
async function storeFavorite(n, img, ing) {
    let response = await fetch(`${server}/favorite`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: `${n}`, image_url: `${img}`, ingredient_list: `${ing}`, instructions: 'currently empty', user_id: `${user.user_id}` })
    });
    let data = await response.json();
    return true;
}
//async function to send a delete query with meal_id to the api server
async function deleteFavorite(meal_id) {
    let response = await fetch(`${server}/favorite`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ meal_id: `${meal_id}` })
    });
    let data = await response.json();
    loadRecipePage();
}


//called when a new user clicks new user link
function newUserFormLoad() {
    const $mainDiv = $("#mainDiv");
    $mainDiv.empty();
    const $newUserForm = $(`
    <div class="centerDiv"><H3>Please enter your information</H3></div>
    <div class="roundedContainerNoHover">
    <div class="spacer"></div><div><p>Username:<input id="username"></p></div>
    <div><p>Password:<input id="pword"></p></div>
    <div><p>Email:<input id="email"></p></div>
    <div><button id="userSubmit" type="button">Submit</button></div>
    <div class="spacer"></div></div>`);
    $newUserForm.appendTo($mainDiv);
    $("#email").keypress(function (event) {//return press submits
        if (event.key == "Enter") {
            insertNewUser();
        }
    })
    $("#userSubmit").click(insertNewUser);//submit button click event calls function to add user
}

//gets the username password and email from the form and sends it to the database
async function insertNewUser() {
    let name = $('#username').val();
    let pword = $('#pword').val();
    let email = $('#email').val();
    let response = await fetch(`${server}/newuser`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: `${name}`, password: `${pword}`, email: `${email}` })
    });
    let resData = await response.json();
    let modal = document.getElementById("myModal");// Get the modal    
    let p = document.getElementById("modalText");
    p.innerHTML = 'User Created! Welcome to the Meal MVP   <button id="close">OK</button>'
    modal.style.display = "block";//open the modal    
    $('#close').click(function () {//ok button clicked, clear the modal and load the login page
        p.innerHTML = ""
        modal.style.display = "none";
        loadFrontPage()
    })
}