function loadFrontPage() {
    const $mainDiv = $("#mainDiv");
    $mainDiv.empty();
    console.log($mainDiv);
    const $frontPageContent = $(`<div class="centerDiv"><H1>Welcome to Meal MVP</H1></div>
<div class="roundedContainer"><div><p>Username:<input id="username"></p></div>
<div><p>Password:<input id="pword"></p></div>
<div><p id="nUser">New Users</p></div></div>`);
    $frontPageContent.appendTo($mainDiv);
    $("#nUser").click(newUserFormLoad);
}
loadFrontPage();
function newUserFormLoad() {
    const $mainDiv = $("#mainDiv");
    $mainDiv.empty();
    const $newUserForm = $(`<div class="centerDiv"><H3>Please enter your information</H3></div>
    <div class="roundedContainer"><div class="spacer"></div><div><p>Username:<input id="username"></p></div>
    <div><p>Password:<input id="pword"></p></div>
    <div><p>Email:<input id="email"></p></div>
    <div><button id="userSubmit" type="button">Submit</button></div><div class="spacer"></div></div>`);
    $newUserForm.appendTo($mainDiv);
    $("#userSubmit").click(insertNewUser);
}

//need to send body data...not sure how
function insertNewUser() {
    $.post(`${process.env.APISERVER}/newuser`, async (data) => {
        try {
            res.json(data.rows);
        } catch (error) {

        }
    });
}
