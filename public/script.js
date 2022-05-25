const server = "http://localhost:3000";
let user = {};



//called on index page load, or when a user logs out
function loadFrontPage() {
    const $mainDiv = $("#mainDiv");
    $mainDiv.empty();
    //build HTML for front page content
    const $frontPageContent = $(`
        <div class="centerDiv"><H1>Welcome to Meal MVP</H1></div>
        <div class="roundedContainer">
        <div><p>Username:<input id="username"></p></div>
        <div><p>Password:<input id="pword"></p></div>
        <div><button id="login" type="button">Login</button></div>
        <div><p id="nUser">New Users</p></div></div>
        `);
    $frontPageContent.appendTo($mainDiv);
    $("#login").click(loadRecipePage);
    $("#nUser").click(newUserFormLoad);
}
loadFrontPage();

//called when user clicks login button
async function loadRecipePage() {
    
    if (Object.keys(user).length === 0){
    let $username = $('#username');
    let $password = $('#pword');
    user = await checkUser($username.val(), $password.val())//returns user object with validated boolean key value pair
    console.log(user);
    }
    const $mainDiv = $("#mainDiv");
    $mainDiv.empty();
    if (user.validated) {        
        //build HTML for top of recipe/search page
        const $recipePageContent = $(`
            <div class="centerDiv"><H3>${user.name}'s favorite Meals</H3></div>
            <div class="roundedContainer">
            <div><p>Recipe Search:<input id="recipeSearch">
            <button id="search" type="button">Search</button></p></div>
        `);
        $recipePageContent.appendTo($mainDiv);
        let $search = $("#search");        
        $search.click(function() {             
            loadSearchResults($("#recipeSearch").val());
        });
        //builds the list of recipes that the user has added as favorites and appends to main div
        const favorites = user.favorites;//array of users favorite recipes, each recipe stored as an object        
        for (let i = 0; i < favorites.length; i++) {            
            let currentFavorite = favorites[i];//get current favorite recipe object
            const $appendDiv = $(`
            <div class="roundedContainer" id="${currentFavorite.meal_id}">
            <h5>${currentFavorite.name}</h5>
            </div>`);
            $appendDiv.appendTo($mainDiv);//append rounded container div with recipe info to the main div
            $(`#${currentFavorite.meal_id}`).click(loadRecipeCard);//add click event listener to rounded container div
        }
    } else {//if the user came back as not validated sends back to front page
        alert("user not recognized");
        loadFrontPage();
    }
}

async function checkUser(n, p) {
    let response = await fetch(`${server}/user`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },        
        body: JSON.stringify({ name: `${n}`, password: `${p}`})
    });
    let retUser = await response.json();    
    return retUser;
}


//called when user clicks search button
async function loadSearchResults(str) {
    //calls to edam api through our api server loads the results into the Main Div after clearing
    const $mainDiv = $("#mainDiv");    
    const $searchPageContent = $(`
        <div class="centerDiv"><H3>${user.name} search results</H3></div>
        <div class="roundedContainer">
        <div><p>Recipe Search:<input id="recipeSearch">
        <button id="search" type="button">Search</button><button id="favorites" type="button">Return to Favorites</button></p></div>
        `);    
    $mainDiv.empty();
    $searchPageContent.appendTo($mainDiv);
    let $favorites = $("#favorites");
    $favorites.click(function(){
        loadRecipePage();
    });
    let $search = $("#search");        
    $search.click(function() {             
        loadSearchResults($("#recipeSearch").val());
    });
    let data = await getSearchData(str)
    //console.log(data);
    for (let i = 0; i < data.length; i++) {            
        let currentMeal = data[i];//get current favorite recipe object
        const $appendDiv = $(`
        <div class="leftroundedContainer" id="${i}">
        <div class="leftimg"><img id="${i}image" src="${currentMeal.image_url}"></div><div class="horizontal"><h5 id="${i}name">${currentMeal.name}</h5>
        <p id="${i}ingredient_list">${currentMeal.ingredient_list}</p></div>
        </div>`);
        $appendDiv.appendTo($mainDiv);//append rounded container div with recipe info to the main div
        $(`#${i}`).click(function(){
            saveFav();
        });//add click event listener to rounded container div
    }
}

async function getSearchData(str){
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
async function saveFav(){
    //save data to database
   if(confirm("do you want to save this recipe?")){
        let id = event.currentTarget.id;
        let $divContainer = $(`#${id}`);

   }
}

//called when a new user clicks new user link
function newUserFormLoad() {
    const $mainDiv = $("#mainDiv");
    $mainDiv.empty();
    const $newUserForm = $(`
    <div class="centerDiv"><H3>Please enter your information</H3></div>
    <div class="roundedContainer">
    <div class="spacer"></div><div><p>Username:<input id="username"></p></div>
    <div><p>Password:<input id="pword"></p></div>
    <div><p>Email:<input id="email"></p></div>
    <div><button id="userSubmit" type="button">Submit</button></div>
    <div class="spacer"></div></div>`);
    $newUserForm.appendTo($mainDiv);
    $("#userSubmit").click(insertNewUser);
}

//need to send body data...not sure how!!! in progress
async function insertNewUser() {
    let name = $('#username').val();
    let pword = $('#pword').val();
    let email = $('#email').val();    
    let response = await fetch(`${server}/newuser`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },        
            body: JSON.stringify({name: `${name}`, password: `${pword}`, email: `${email}`})
    });
    let resData = await response.json();    
    console.log(resData);
    alert("new user created");
    loadFrontPage();
}