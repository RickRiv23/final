const express = require("express");
const mysql   = require("mysql");
const sha256  = require("sha256");
const session = require('express-session');
const ejs = require("ejs");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("assets")); //folder for images, css, js
app.use(express.urlencoded()); //use to parse data sent using the POST method
app.use(session({ secret: 'any word', cookie: { maxAge: 60000 }}));

// app.use(myMiddleware);

// function myMiddleware(req, res, next){
//   console.log(new Date());
//   next()
// }

//routes
app.get("/", async function(req, res){
    let heroesList = await getSuperheroes();
    
    console.log("Grabbing heroes");
    
    res.render("index", {"heroesList":heroesList});
});

app.get("/search", async function(req, res){
    let heroesList = await getSuperheroes();
    
    console.log("Grabbing heroes");
    
    res.render("index", {"heroesList":heroesList});
});

//login route
app.get("/login", function(req, res){
   res.render("login");
});

//logout route
app.get("/logout", function(req, res){
   // console.log("logging")
   res.session.destroy();
   res.redirect("/");
});

//reports route
app.get("/reports", async function(req, res){
    let heroesList = await getSuperheroesDESC();
    let heroAvg = await getSuperheroesCOST();
    let heroAvgAge = await getYoungestHero();

    console.log("going into reports.ejs")
    console.log("herolist length in .get: ", heroesList.length);
    console.log("herolist avg: ", heroAvg);
    console.log("hero year avg: ", heroAvgAge);

//get avg
    let avgPrice = 0;
    // let avgDrink = 0;
    for(let i = 0; i < heroAvg.length; i++){
        avgPrice += heroAvg[i].price;
    }
    avgPrice /= heroAvg.length;

//get avgAge
    let age = 0;
    for(let i = 0; i < heroAvgAge.length; i++){
        age += 2019-heroAvgAge[i].year_appeared;
    }
    age /= heroAvgAge.length;
    
    
   res.render("reports", {"heroesList":heroesList , "heroAvg":avgPrice.toFixed(2) , "ageAvg": age.toFixed(0) });
});

app.get("/admin", async function(req, res){
    
   console.log("authenticated: ", req.session.authenticated);    
   
   if (req.session.authenticated) { //if user hasn't authenticated, sending them to login screen
       
       let heroesList = await getSuperheroes();  
       console.log(heroesList);
       res.render("admin", {"heroesList":heroesList});  
       
    // let authorList = await getAuthorList();  
       //console.log(authorList);
       //res.render("admin", {"authorList":authorList});  
       
   }  else { 
    
       res.render("login"); 
   
   }
});

app.post("/loginProcess", function(req, res) {
    
    if ( req.body.username == "admin" && sha256(req.body.password) == "2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b") {
       req.session.authenticated = true;
       res.send({"loginSuccess":true});
    } else {
       res.send(false);
       
    }

    
});

app.get("/addHeroes", function(req, res){
    console.log("in adding heroes");
  res.render("newHero");
  
});

app.post("/addHeroes", async function(req, res){
    let group = req.body.group ? req.body.group : ""
    
  let rows = await insertHero(req.body);
  let insertHistory = await addHistory(req.body);
  let insertPrice = await addPrice(req.body);
  
  console.log(rows);
  //res.send("First name: " + req.body.firstName); //When using the POST method, the form info is stored in req.body
  let message = "Hero WAS NOT added to the database!";
  if (rows.affectedRows > 0) {
      message= "Hero successfully added!";
  }
  res.render("newHero", {"message":message});
    
});

app.get("/ajax/getHero", async function(req, res){
    let rows = await getHeroInfo(req.query.heroId);
    console.log("Get Hero Info ")
    res.send(rows);
});

app.get("/ajax/searchHero", async function(req, res){
    console.log("Trying to search heroes");
    let rows = await searchHeroes(req.query);
    console.log("Searched Heroes ")
    res.send(rows);
});

app.get("/ajax/deleteHero", async function(req, res){
    try{
        
        let removeHero = await deleteHero(req.query.heroID);        //  REQUIRES heroID as a parameter
        let removeHistory = await deleteHistory(req.query.heroID);
        let removePrice = await deletePrice(req.query.heroID);
        
        if(removeHero && removeHistory && removePrice){
            let heroesList = await getSuperheroes();  
            console.log("Hero deleted.");
            res.render("admin", {"heroesList":heroesList});         //  SUCCESSFUL delete
        } else{
            console.log("Hero was unable to be deleted.");
        }
        
    } catch(e){
        console.log("Hero was unable to be deleted. Error - ");
        console.error(e);
    }
});

app.get("/updateHero", async function(req, res){
    
    let heroInfo = await getHeroInfo(req.query.heroId);
    
    // console.log("hero info:")
    // console.log(heroInfo);
    
    res.render("updateHero", {"heroInfo":heroInfo});
});

app.post("/updateHero", async function(req, res){
  let rows = await updateHero(req.query.heroId, req.body);
  
  let heroInfo = req.body;
  console.log(rows);
  //res.send("First name: " + req.body.firstName); //When using the POST method, the form info is stored in req.body
  let message = "Hero WAS NOT updated!";
  if (rows.affectedRows > 0) {
      message= "Hero successfully updated!";
  }
  res.render("updateHero", {"message":message, "heroInfo":heroInfo});
    
});


/*  FUNCTIONS   */

function deleteHero(heroId){        // DELETES from heroes table
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `DELETE FROM heroes
                      WHERE heroId = ${heroId}`;
        
           conn.query(sql, [heroId], function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function deleteHistory(heroId){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `DELETE FROM hero_history
                      WHERE heroId = ${heroId}`;
        
           conn.query(sql, [heroId], function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function deletePrice(heroId){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `DELETE FROM hero_prices
                      WHERE heroId = ${heroId}`;
        
           conn.query(sql, [heroId], function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function updateHero(heroId, body){
   
  let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
          if (err) throw err;
          console.log("Connected!");
        
          let sql = `UPDATE heroes
                      SET name = ?, 
                      alias = ?, 
                      gender = ?,
                      universe = ?,
                      imageURL = ?,
                      information = ?
                      WHERE heroId = ${heroId}`;
          
        //   console.log("hero ID: " + heroId);
          let params = [body.name, body.alias, body.gender, body.universe, body.image, body.info, body.heroId];
        
          console.log(sql);
           
          conn.query(sql,  params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
          });
        
        });//connect
    });//promise 
}



// app.get("/dataTest", async function(req, res){
    
//   console.log("authenticated: ", req.session.authenticated);    
   
//   if (req.session.authenticated) { //if user hasn't authenticated, sending them to login screen
       
//      let heroList = await getSuperheros();  
//       //console.log(authorList);
//       res.render("admin", {"heroList":heroList});  
       
//   }  else { 
    
//       res.render("login"); 
   
//   }
// });

function getHeroInfo(heroID){       //  Gets ALL hero info based on heroId
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT * FROM heroes 
                    NATURAL JOIN hero_history
                    NATURAL JOIN hero_prices
                    WHERE heroId = ${heroID}`;
        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promis
    
}

function searchHeroes(query){
    let keyword = query.searchTerm;
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
            
            let params = [];
            
            let sql = 
                `SELECT * FROM heroes 
                NATURAL JOIN hero_history
                NATURAL JOIN hero_prices
                WHERE
                (name LIKE '%${keyword}%'`;
            
            if (query.universe) { //user selected a universe
                sql += " AND universe = '" + query.universe +"'"; //To prevent SQL injection, SQL statement shouldn't have any quotes.
            }
            
            if (query.gender) { //user selected a sex
                sql += " AND gender = '" + query.gender +"'"; //To prevent SQL injection, SQL statement shouldn't have any quotes.
            }
            
            sql += ")";
            
            params.push(query.universe);
            params.push(query.gender);
            
            conn.query(sql, params, function (err, rows, fields) {
            if (err) throw err;
            conn.end();
            resolve(rows);
            });
        
        });
    });
}

function getSuperheroes(){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT *
                        FROM heroes`;
        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function getSuperheroesDESC(){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT *
                        FROM heroes
                        ORDER BY heroId`;

           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}
function getSuperheroesCOST(){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT *
                        FROM hero_prices`;
                        

           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function getYoungestHero(){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT *
                        FROM hero_history`;
                        

           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function insertHero(body, group){
   
  let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
          if (err) throw err;
          console.log("Connected!: insertheroes");
        
          let sql = `INSERT INTO heroes
                        (name,alias,gender,universe,imageURL,information)
                         VALUES (?,?,?,?,?,?)`;
        
          let params = [body.name, body.alias, body.gender, body.universe, body.imageURL, body.information];
        
          conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
          });
          console.log(sql);
        
        });//connect
    });//promise 
}

function addHistory(body)
{
     let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
          if (err) throw err;
          console.log("Connected!: insertheroes");
        
          let sql = `INSERT INTO hero_history
                        (year_appeared, comic_appeared, heroId)
                         VALUES (?,?,?)`;
        
          let params = [body.year_appeared, body.comic_appeared, body.heroId];
        
          conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
          });
          console.log(sql);
        
        });//connect
    });//promise 
}

function addPrice(body)
{
      let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
          if (err) throw err;
          console.log("Connected!: insertheroes");
        
          let sql = `INSERT INTO hero_prices
                        (price)
                         VALUES (?)`;
        
          let params = [body.price];
        
          conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
          });
          console.log(sql);
        
        });//connect
    });//promise 
}

function dbConnection(){

   let conn = mysql.createConnection({
        host: "cst336db.space",
        user: "cst336_dbUser27",
        password: "uzef6q",
        database: "cst336_db27"
    }); //createConnection

    return conn;

}

//starting server
app.listen(process.env.PORT, process.env.IP, function(){
console.log("Express server is running...");
});