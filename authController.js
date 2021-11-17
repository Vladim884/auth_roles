const express = require('express');
const User = require('./models/User');
const Role = require('./models/Role');
const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const {secret} = require('./config');

const path = require('path');  
const json2csv = require("json2csv");
const urlencodedParser = express.urlencoded({extended: false});
const convertCsvToXlsx = require('@aternus/csv-to-xlsx');
const rimraf = require('rimraf');const hbs = require("hbs");

const csvpath = './newcsv.csv';
const exelpath = './newxl.xlsx';

const app = express();
const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, {expiresIn: "1h"} )
}
let results = [];
let req_name;
let req_group;
let req_find;
let ind = 0;


class authController {
    async registration (req, res){
        try {
            
                if(!req.body) return res.sendStatus(400);
                // console.log(req.body.userName);
                // res.send(`${req.body.userName} - ${req.body.password}`);
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка при регистрации", errors});
            }
            const {username, password} = req.body;

            if(username.length === 0 || username === " "){
                return res.status(400).json({message: 'Некорректный воод! Заполните поле имени'});
            }
            if(password.length < 4 || password.length > 10){
                return res.status(400).json({message: 'Некорректный воод! Пароль бдолжен быть не меньше 4 и не больше 10 знаков'});
            }
            

            const candidate = await User.findOne({username});
            if (candidate){
               return res.status(400).json({message: 'Пользователь с таким именем уже существует'});
            }
            // const userRole = await Role.findOne({value: 'ADMIN'});
            const userRole = await Role.findOne({value: 'USER'});
            const hashPassword = bcrypt.hashSync(password, 7);
            const user = new User({username, password: hashPassword, roles: [userRole.value]});
            await user.save();
            // return res.status(201).json({message: "Пользователь успешно зарегистрирован"});
            // return res.sendFile(__dirname + "/start.html");
            res.render('login.hbs');
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: 'Registration error'});
        }
    }
    async registration (req, res){
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка при регистрации", errors});
            }
            const {username, password} = req.body;
            const candidate = await User.findOne({username});
            if (candidate){
                res.status(400).json({message: 'Пользователь с таким именем уже существует'});
            }
            // const userRole = await Role.findOne({value: 'ADMIN'});
            const userRole = await Role.findOne({value: 'USER'});
            const hashPassword = bcrypt.hashSync(password, 7);
            const user = new User({username, password: hashPassword, roles: [userRole.value]});
            await user.save();
            return res.status(201).json({message: "Пользователь успешно зарегистрирован"});
        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'Registration error'});
        }
    }
    async login (req, res){
        try {
            const {username, password} = req.body;
            const user = await User.findOne({username});
            if(!user){
                return res.status(400).json({message: `Пользователь с именем: ${username} не найден.`});
            }
            const validPassword = bcrypt.compareSync(password, user.password);
            if(!validPassword){
                return res.status(400).json({message: `Введен неверный пароль.`});
            }
            const token = generateAccessToken(user._id, user.roles);
            if(!token){
                console.log(token);
                // return res.sendFile(__dirname + "/index.html");
                res.render("contact.hbs");
            }
            // return res.sendFile(__dirname + "./views/start.hbs");
            // return res.sendFile(__dirname + "/index.html");
            res.render("start.hbs");
        } catch (e) {
            console.log(e);
        }
    }
    
    async getUsers (req, res){
        try {
            // const userRole = new Role();
            // const adminRole = new Role({value: 'ADMIN'});
            // await userRole.save();
            // await adminRole.save();
            // res.json('server work');
             const users = await User.find();
            res.json(users);
            
        } catch (e) {
            console.log(e);
        }
    }
    

    async starter (req, res){

    
    let resfind = [];
    let resname = [];
    let resgroup = [];


    
    
    //==========
    
try {
    if(fs.existsSync(csvpath)){
        fs.unlinkSync(csvpath);
        console.log('csv-file was delete!');
    } 
    if(fs.existsSync(exelpath)){
        fs.unlinkSync(exelpath);
        console.log('exel-file was delete!');
    } 
    else {
        console.log('Main directory does not contain temporary csv or exel files');
    }
}  catch(err) {
    console.error(err)
  }
    // console.log(__dirname);
    let filedata = req.file;
    if(!filedata) res.send("Ошибка при загрузке файла");
    else {
        
        let filepath = `${__dirname}${"1\\2".match(/\\/)}${filedata.path}`;
        // res.send("Файл загружен");
        console.log(filepath);
        fs.createReadStream(filepath)
            .pipe(csv())
            .on('data', (data) => {
                results.push(data);
                console.log(results);
                // console.log(results[ind]);
            })
            .on('end', () => {
                
                for (let i = 0; i < results.length; i++) {
                    let data_f = results[i]['Поисковые_запросы'];
                    let data_n = results[i]['Название_позиции'];
                    let data_g = results[i]['Название_группы'];

                    resfind.push(data_f);
                    resname.push(data_n);
                    resgroup.push(data_g);
                }
                req_name = resname;
                req_group = resgroup;
                req_find = resfind;
                res.render("upload1.hbs", {
                    req_name: req_name,
                    req_group: req_group,
                    req_find: req_find,
                    resfind: resfind,
                    resname: resname,
                    resgroup: resgroup
                });
            });
        }
        

    }
    async uploader (request, response)  {
        console.log('upload-func');
        if(!request.body) return response.sendStatus(400);
        console.log(request.body.req_find);
        for (let i = 0; i < results.length; i++) {
            console.log("request.body.req_find");
            console.log(request.body.req_find[i]);
            results[i]['Поисковые_запросы'] = request.body.req_find[i];
            results[i]['Название_позиции'] = request.body.req_name[i];
            results[i]['Название_группы'] = request.body.req_group[i];
        }
        let apiDataPull = Promise.resolve(results).then(data => {
            return json2csv.parseAsync(data, {fields: Object.keys(results[0])})
        }).then(csv => {
            //==================
            let myFirstPromise = new Promise((resolve, reject) => {
                fs.writeFile('newcsv.csv', csv, function (err) {
                    if (err) throw err;
                    console.log('File Saved!');
                    ind++;
                    console.log(ind);
                    resolve("Temporary files created!");
                });
            });
            myFirstPromise.then((message)=>{
                let source = path.join(__dirname, 'newcsv.csv');
                let destination = path.join(__dirname, './newxl.xlsx');

                try {
                convertCsvToXlsx(source, destination);
                } catch (e) {
                console.error(e.toString());
                }
                rimraf('./uploads/*', function () { 
                    console.log('Directory ./uploads is empty!'); 
                // !! if you remove the asterisk -> *, this folder will be deleted!
            });
                console.log(message);
            });
            //=====================
            // fs.writeFile('newcsv.csv', csv, function (err) {
            //     if (err) throw err;
            //     console.log('File Saved!');
            //     ind++;
            //     // if (ind>2) res.end("hello");
            //     console.log(ind);
            // });

        });
        // app.get('/upload1.hbs', function (req, res) {
        //     const file = './pubmaticData.csv';
        //     res.download(file); // Устанавливаем диспозицию и отправляем ее.
        // });
    }

    async downloadNew (req, res) {
    const file = './newxl.xlsx';
    res.download(file, function () {
        fs.unlinkSync(csvpath);
        fs.unlinkSync(exelpath);
        console.log('Main directory does not contain temporary csv or exel files');

    }); 
}



}

module.exports = new authController();