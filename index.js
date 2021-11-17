const express = require('express');
const multer  = require("multer");
const fs = require('fs');
const path = require('path');  
const csv = require('csv-parser');
const json2csv = require("json2csv");
const urlencodedParser = express.urlencoded({extended: false});
const convertCsvToXlsx = require('@aternus/csv-to-xlsx');
const rimraf = require('rimraf');const hbs = require("hbs");
const { engine } = require('express-handlebars');
const expressHbs = require('express-handlebars');

const mongoose = require('mongoose');
const authRouter = require('./authRoutes')
const PORT = process.env.PORT || 5000;

const app = express();
app.engine('handlebars', engine({ layoutsDir: "views/layouts", extname: '.hbs', defaultLayout: "layout"}));
app.set('view engine', 'handlebars');
// app.engine("hbs", expressHbs(
//     {
//         layoutsDir: "views/layouts", 
//         defaultLayout: "layout",
//         extname: "hbs"
//     }
// ));
hbs.registerPartials(__dirname + "/views/partials");
app.set("view engine", "hbs");
app.use(multer({dest:"uploads"}).single("filedata"));


app.use(express.json());
app.use(express.static(__dirname + '/')); 
app.use('/auth', authRouter);
app.use("/contact", function(request, response){
     
    res.render("contact.hbs");
});
app.use("/login", function(req, res){
    res.render('login.hbs');
});
app.use("/", function(req, res){
    // return res.sendFile(__dirname + "/index.html");
    res.render('index.hbs');
});



// app.post("/upload1", function (req, res, next) {
//     let results = [];
//     let resfind = [];
//     let resname = [];
//     let resgroup = [];
    
//     //==========
    
// try {
//     if(fs.existsSync(csvpath)){
//         fs.unlinkSync(csvpath);
//         console.log('csv-file was delete!');
//     } 
//     if(fs.existsSync(exelpath)){
//         fs.unlinkSync(exelpath);
//         console.log('exel-file was delete!');
//     } 
//     else {
//         console.log('Main directory does not contain temporary csv or exel files');
//     }
// }  catch(err) {
//     console.error(err)
//   }
//     // console.log(__dirname);
//     let filedata = req.file;
//     if(!filedata) res.send("Ошибка при загрузке файла");
//     else {
        
//         let filepath = `${__dirname}${"1\\2".match(/\\/)}${filedata.path}`;
//         // res.send("Файл загружен");
//         fs.createReadStream(filepath)
//             .pipe(csv())
//             .on('data', (data) => {
//                 results.push(data);
//                 // console.log(results[ind]);
//             })
//             .on('end', () => {
                
//                 for (let i = 0; i < results.length; i++) {
//                     let data_f = results[i]['Поисковые_запросы'];
//                     let data_n = results[i]['Название_позиции'];
//                     let data_g = results[i]['Название_группы'];

//                     resfind.push(data_f);
//                     resname.push(data_n);
//                     resgroup.push(data_g);
//                 }
//                 let req_name = resname;
//                 let req_group = resgroup;
//                 let req_find = resfind;
//                 res.render("upload1.hbs", {
//                     req_name: req_name,
//                     req_group: req_group,
//                     req_find: req_find,
//                     resfind: resfind,
//                     resname: resname,
//                     resgroup: resgroup
//                 });
//             });
//         }
//         app.post("/upload1.hbs", urlencodedParser, function (request, response) {
//             if(!request.body) return response.sendStatus(400);
//             console.log(request.body.req_find);
//             for (let i = 0; i < results.length; i++) {
//                 console.log("request.body.req_find");
//                 console.log(request.body.req_find[i]);
//                 results[i]['Поисковые_запросы'] = request.body.req_find[i];
//                 results[i]['Название_позиции'] = request.body.req_name[i];
//                 results[i]['Название_группы'] = request.body.req_group[i];
//             }
//             let apiDataPull = Promise.resolve(results).then(data => {
//                 return json2csv.parseAsync(data, {fields: Object.keys(results[0])})
//             }).then(csv => {
//                 //==================
//                 let myFirstPromise = new Promise((resolve, reject) => {
//                     fs.writeFile('newcsv.csv', csv, function (err) {
//                         if (err) throw err;
//                         console.log('File Saved!');
//                         ind++;
//                         console.log(ind);
//                         resolve("Temporary files created!");
//                     });
//                 });
//                 myFirstPromise.then((message)=>{
//                     let source = path.join(__dirname, 'newcsv.csv');
//                     let destination = path.join(__dirname, './newxl.xlsx');

//                     try {
//                     convertCsvToXlsx(source, destination);
//                     } catch (e) {
//                     console.error(e.toString());
//                     }
//                     rimraf('./uploads/*', function () { 
//                         console.log('Directory ./uploads is empty!'); 
//                     // !! if you remove the asterisk -> *, this folder will be deleted!
//                 });
//                     console.log(message);
//                 });
//                 //=====================
//                 // fs.writeFile('newcsv.csv', csv, function (err) {
//                 //     if (err) throw err;
//                 //     console.log('File Saved!');
//                 //     ind++;
//                 //     // if (ind>2) res.end("hello");
//                 //     console.log(ind);
//                 // });

//             });
//             // app.get('/upload1.hbs', function (req, res) {
//             //     const file = './pubmaticData.csv';
//             //     res.download(file); // Устанавливаем диспозицию и отправляем ее.
//             // });
//         });
// });


const start = async () => {
    try {
        // qwerty123
        await mongoose.connect('mongodb+srv://qwerty:qwerty123@cluster0.8eps6.mongodb.net/auth_roles1?retryWrites=true&w=majority')
        app.listen( PORT, ()=>{
            // app.use("/", function(req, res){
            //     res.sendFile(__dirname + "/index.html");
            // });
            // app.use("/login", function(req, res){
            //     res.sendFile(__dirname + "/login.html");
            //     res.render('/login.hbs');
            // });
            // app.use("/", function(req, res){
            //     res.sendFile(__dirname + "/index.html");
                // res.render('/index.hbs');
            // });
            // app.post("/auth/registration", function(req, res){
            //     res.sendFile(__dirname + "/start.html");
            // });
            console.log(`server started on ${PORT}`)
        });
        
    } catch (e) {
        console.log(e)
    }
}
start();