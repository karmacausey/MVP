require("dotenv").config();
const express = require("express");
const db = require("./db/conn.js");
const app = express();
app.use(express.static("public"));


//create: new user
app.post("/newuser", async (req, res) => {
    try {
        db.query('INSERT INTO Users (user_name, password, email) VALUES ($1,$2,$3);', [req.body.user_name, req.body.password, req.body.email]);        
        res.json(req.body);
    } catch (error) {
        res.json(error);
    }
});

//read: get all favorites assigned to current user
app.get("/favorites", async (req, res) => {
    try {
        const data = await db.query('SELECT Meals.name, Meals.image_url, Meals.ingredient_list, Meals.instructions FROM Meals INNER JOIN top_ten ON top_ten.meal_id=Meals.meal_id AND user_id = $1;', [req.body.user_id])
        res.json(data.rows)
    } catch (error) {
        res.json(error)
    }
});

//read: get recipes by user entered keyword
app.get("/search/:keyword", async (req, res) => {
    try {
        //query edam api
        $.get(`https://api.edamam.com/api/recipes/v2?type=public&q=${req.params.keyword}&app_id=e5eac9e7&app_key=%20ce3b16e9e298aa97fbc47836d7c160bf`, (data) => {
            res.json(data.rows);
        });
    } catch (error) {
        res.json(error);
    }
});

//create: new favorite recipe
app.post("/favorite", async (req, res) => {
    try {
        const data = await db.query('INSERT INTO Meals (name, image_url, ingredient_list, instructions) VALUES ($1,$2,$3,$4) RETURNING meal_id;', [req.body.name, req.body.image_url, req.body.ingredient_list, req.body.instructions]);
        db.query('INSERT INTO top_ten (user_id, meal_id) VALUES ($1,$2);', [req.body.user_id, data.rows[0]]);
        res.json(req.body);
    } catch (error) {
        res.json(error);
    }
});


//update: reset password
app.patch("/password", async (req,res) => {
    try {
        db.query('UPDATE Users SET (password) = ($1) WHERE id=$2;',[req.body.password, req.body.user_id]);
        res.json(req.body);
    } catch (error) {
        res.json(error);
    }

})

//delete: delete a favorite recipe
app.delete("/favorite", async (req,res) => {
    try {
        db.query('DELETE FROM Meals AND top_ten WHERE id=$1', [req.body.meal_id]);
        res.json(req.body);
    } catch (error) {
        res.json(error);
    }

})

app.listen(process.env.PORT, () => {
    console.log(`connecting to: ${process.env.DATABASE_URL}`);
    console.log(`listening on Port ${process.env.PORT}`);
});
