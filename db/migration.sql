DROP TABLE IF EXISTS Users;

CREATE TABLE Users(
   user_id SERIAL PRIMARY KEY NOT NULL,
   user_name CHAR(50) NOT NULL,
   password CHAR(50) NOT NULL,
   email CHAR(100) NOT NULL
);

DROP TABLE IF EXISTS top_ten;

CREATE TABLE top_ten(
   id SERIAL PRIMARY KEY NOT NULL,
   user_id INT NOT NULL,
   meal_id INT NOT NULL
);

DROP TABLE IF EXISTS Meals;

CREATE TABLE Meals(
   meal_id SERIAL PRIMARY KEY NOT NULL,
   name CHAR(50) NOT NULL,
   image_url TEXT NOT NULL,
   ingredient_list TEXT NOT NULL,
   instructions TEXT NOT NULL
);