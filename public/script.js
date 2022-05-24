const server = "http://localhost:3000";



//called on index page load, or when a user logs out
function loadFrontPage() {
    const $mainDiv = $("#mainDiv");
    $mainDiv.empty();
    //console.log($mainDiv);
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
    let $username = $('#username');
    let $password = $('#pword');
    const user = await checkUser($username.val(), $password.val())//returns user object with validated boolean key value pair
    console.log(user);
    if (user.validated) {
        const $mainDiv = $("#mainDiv");
        $mainDiv.empty();
        //console.log($mainDiv);
        const $recipePageContent = $(`
            <div class="centerDiv"><H3>${user.name}'s favorite Meals</H3></div>
            <div class="roundedContainer">
            <div><p>Recipe Search:<input id="recipeSearch">
            <button id="search" type="button">Search</button></p></div>
        `);
        $recipePageContent.appendTo($mainDiv);
        $("#search").click(loadSearchResults);
        const favorites = user.favorites;//array of users favorite recipes, each recipe stored as an object
        for (let i = 0; i < favorites.length; i++) {
            let currentFavorite = favorites[i];//get current favorite recipe object
            const $appendDiv = $(`
            <div class="roundedContainer" id="${currentFavorite.meal_id}">
            <div><img src="${currentFavorite.image_url}"><h5>${currentFavorite.name}</h5></div>
            </div>`);
            $appendDiv.appendTo($mainDiv);//append rounded container div with recipe info to the main div
            $(`#${currentFavorite.meal_id}`).click(loadRecipeCard);//add click event listener to rounded container div
        }
    } else {
        alert("user not recognized");
        loadFrontPage();
    }
}

async function checkUser(n, p) {
    const response = await fetch(`${server}/user`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },        
        body: JSON.stringify({ name: `${n}`, password: `${p}`})
    });
    const retUser = await response.json();
    //console.log(data);
    return retUser;
}
// console.log(server)
    // $.post(`${server}/user`,
    // { name: `${n}`, password: `${p}`})
    // .done(function (data) {
    //     console.log("User Created: " + data);
    // });
    //test data (no db)
    // return {
    //     name: "testUser",
    //     validated: true,
    //     favorites: []
    // }

//called when user clicks search button
function loadSearchResults() {
    //calls to edam api through our api server loads the results into the Main Div after clearing
    $mainDiv.empty();
    //console.log($mainDiv);
    const $searchPageContent = $(`
        <div class="centerDiv"><H3>${user.name} search results</H3></div>
        <div class="roundedContainer">
        <div><p>Recipe Search:<input id="recipeSearch">
        <button id="search" type="button">Search</button></p></div>
        `);
    $searchPageContent.appendTo($mainDiv);
    $("#search").click(loadSearchResults);
    $.get(`${process.env.APISERVER}/search/:${$('#recipeSearch').textContent}`, (data) => {
        res.json(data.rows);//do something here!!!!!!!!!!!
    });

}
//called when a recipe is clicked
function loadRecipeCard() {
    //pulls up a recipe card modal over current page
}

//called when a new user clicks new user link
function newUserFormLoad() {
    //const $mainDiv = $("#mainDiv");
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
function insertNewUser() {
    let name = $('#username').textContent
    let pword = $('#pword').textContent
    let email = $('#email').textContent
    $.post(`${process.env.APISERVER}/newuser`,
        { name: `${name}`, password: `${pword}`, email: `${email}` })
        .done(function (data) {
            console.log("User Created: " + data);
        });

}