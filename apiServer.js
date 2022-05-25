require("dotenv").config();
const express = require("express");
const db = require("./db/conn.js");
const fetch = require('node-fetch');
const app = express();
app.use(express.json());
app.use(express.static("public"));



//create: new user
app.post("/newuser", async (req, res) => {
    try {
        db.query('INSERT INTO Users (user_name, password, email) VALUES ($1,$2,$3);', [req.body.name, req.body.password, req.body.email]);
        res.json({status: "entered"});
    } catch (error) {
        res.json(error);
    }
});

app.post("/user", async (req, res) => {
    try {
        const userData = await db.query('SELECT user_name, user_id FROM Users WHERE user_name = $1 AND password = $2;', [req.body.name, req.body.password])
        const userFavorites = await db.query('SELECT Meals.meal_id, Meals.name, Meals.image_url, Meals.ingredient_list, Meals.instructions FROM Meals INNER JOIN top_ten ON top_ten.meal_id=Meals.meal_id AND user_id = $1;', [userData.rows[0].user_id]);
        if (userData.rows.length !== 0) {
            const favArray = [];
            for (let i = 0; i < userFavorites.rows.length; i++) {
                const currentFav = {
                    meal_id: `${userFavorites.rows[i].meal_id}`,
                    name: `${userFavorites.rows[i].name}`,
                    image_url: `${userFavorites.rows[i].image_url}`,
                    ingredient_list: `${userFavorites.rows[i].ingredient_list}`,
                    instructions: `${userFavorites.rows[i].instructions}`,
                }
                favArray[i] = currentFav;
            }
            const user = {
                name: `${userData.rows[0].user_name}`,
                validated: true,
                favorites: favArray
            }
            res.json(user);
        } else {
            res.json({ validated: false })
        }
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});

app.get("/users", async (req, res) => {
    try {
        const data = await db.query('SELECT * FROM Users;');
        res.json(data.rows);
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
        let response = await fetch(`https://api.edamam.com/api/recipes/v2?type=public&q=${req.params.keyword}&app_id=e5eac9e7&app_key=ce3b16e9e298aa97fbc47836d7c160bf`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        let data = await response.json();
        //console.log(data.hits[0].recipe.source);
        let resultArray = [];
        for(let i = 0; i < data.hits.length && i < 50; i++){                
            const currentResult = {
                image_url: `${data.hits[i].recipe.images.REGULAR.url}`,          
                name: `${data.hits[i].recipe.label}`,
                ingredient_list: `${data.hits[i].recipe.ingredientLines.join(',<br>')}`,
                
            }
            resultArray.push(currentResult)                
        }
        res.json(resultArray)
    } catch (error) {
        console.log(error)
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
app.patch("/password", async (req, res) => {
    try {
        db.query('UPDATE Users SET (password) = ($1) WHERE id=$2;', [req.body.password, req.body.user_id]);
        res.json(req.body);
    } catch (error) {
        res.json(error);
    }

})

//delete: delete a favorite recipe
app.delete("/favorite", async (req, res) => {
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
