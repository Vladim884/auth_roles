const User = require('./models/User');
const Role = require('./models/Role');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const {secret} = require('./config');

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, {expiresIn: "1h"} )
}

class authController {
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
                res.status(400).json({message: `Пользователь с именем: ${username} не найден.`});
            }
            const validPassword = bcrypt.compareSync(password, user.password);
            if(!validPassword){
                res.status(400).json({message: `Введен неверный пароль.`});
            }
            const token = generateAccessToken(user._id, user.roles);
            return res.json({token});
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
}

module.exports = new authController();