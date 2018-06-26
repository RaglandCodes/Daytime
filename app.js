var express = require('express');
sql = require('mysql'),
    fs = require('fs'),
    path = require('path'),
    mysql = require('mysql'),
    bodyParser = require('body-parser');


var app = express();
app.use(express.static('public'));
var urlEncodedParser = bodyParser.urlencoded({ extended: false });

//ar indexHTML = fs.read
var currentUser = "new";
var newtitle, newdescription,
    newstartTime, newstartMeridien,
    newendTime, newendMeridien, newdate;

var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efkj';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'deltadb'
});

connection.connect((err) => {
    var sql = "SELECT * FROM calendar";

    connection.query(sql, (err, res, fields) => {

        if (res == undefined) {
            modifyTable("new");
        }
    });


});

function userManage(name, password, cb) {
    //connection.
    connection.connect((err) => {
        var checkUserQuery = "SELECT * FROM user WHERE name = '" + name + "'";
        connection.query(checkUserQuery, (err, res) => {

            if (res.length == 0) {//new user
                var newUserQuery = "INSERT INTO user (name, password) VALUES ('" + name + "' , '" + encrypt(password) + "')";

                connection.query(newUserQuery, (err, res) => {

                    currentUser = name;
                    console.log("current user = " + currentUser);
                    cb();


                })

            }
            else { // returning user
                var passwordCheckQuery = "SELECT * FROM user WHERE name = '" + name + "' AND password = '" + encrypt(password) + "'";
                connection.query(passwordCheckQuery, (err, res) => {
                    if (res.length == 0) {
                        cb();

                    }
                    else {
                        currentUser = name;
                        console.log("cu = " + currentUser);

                        cb();

                    }
                })



            }
        });

    })

}
function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

function modifyTable(action, cb) {
    if (action == "new") {
        connection.connect((err) => {
            var newCalendarTableQuery = "CREATE TABLE calendar (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(225), description VARCHAR(225),date VARCHAR(225), st INT, sm VARCHAR(225), et INT, em VARCHAR(225), owner VARCHAR(225))";
            var newUserTableQuery = "CREATE TABLE user (name VARCHAR(225), password VARCHAR(225))"

            connection.query(newCalendarTableQuery, (err, res) => {
/*                console.log("for new items table");
                console.log(err);
                console.log(res); */
                
            });

            connection.query(newUserTableQuery, (err, res) => {

            });

        })
    }

    else if(action == "insert")
    {
        var newEventQuery = "INSERT INTO calendar (title, description, date, st, sm, et, em, owner) VALUES('"+newtitle+"', '" + newdescription + "', " + newdate + ", " + newstartTime + ", '" +  newstartMeridien + "', " + newendTime +", '" 
        + newendMeridien +"', '" + currentUser + "')";

        connection.query(newEventQuery, (err, res) => {
            console.log("new event : ");
            console.log(err);
            console.log(res);
            cb();
            
            
        })

        console.log(newEventQuery);
        
    }
}

app.post('/newevent', urlEncodedParser, (req, resp) => {
        newtitle = req.body.title;
        newdescription = req.body.description;
        newstartTime = req.body.startTime;
        newstartMeridien = req.body.startMeridien;
        newendTime = req.body.endTime;
        newendMeridien = req.body.endMeridien
        newdate = req.body.date;

//        console.log(newtitle + " " + newdescription + " " + newstartMeridien + " " + newstartTime + " " + newendTime+newendMeridien + " " + newdate);
    modifyTable("insert",  () => {
        resp.end();
    });
    


});
app.post('/signin-check', urlEncodedParser, (req, resp) => {
    //console.log(req.body.username + " " + req.body.password);

    userManage(req.body.username, req.body.password, () => {
        //callback
        if (currentUser == "new") {
            //var filePath = path.join(__dirname, './public/login.html')
            //resp.sendFile(filePath);
            resp.end("bad")
        }
        else {
            resp.end(currentUser);

        }
        console.log(currentUser);

        /*resp.send(currentUser);
        resp.end();*/

    });
    //*/
    // resp.writeHead(200);

});

/*app.get('/signin-check', (req, resp) => {
    resp.write(currentUser);
});*/

app.get('/info', (req, resp) => {
    console.log("here's to information");
    var sql = "SELECT * FROM calendar WHERE owner = '" + currentUser + "'";
    var info;
    //console.log(sql);


    connection.query(sql, (err, res, fields) => {
        info = res;
        info = JSON.stringify(info);
        resp.send(info);
    })
    
    
});

app.get('/homepage', (req, resp) => {
    var filePath = path.join(__dirname, './public/home.html')
    resp.sendFile(filePath);

});

app.get('/signout', (req, resp) => {
    console.log("good bye");
    currentUser = "new";
    resp.send();
    
})
app.get('/', (req, resp) => {
    if (currentUser == "new") {
        var filePath = path.join(__dirname, './public/login.html')
        resp.sendFile(filePath);
    }
    else {
        var filePath = path.join(__dirname, './public/home.html')
        resp.sendFile(filePath);
    }
});

app.listen(2345, () => {
});