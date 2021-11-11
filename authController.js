const User = require('./models/User');
const Role = require('./models/Role');
const bcrypt = require('bcrypt');

class authController {
    async registration (req, res){
        try {
            const {username, password} = req.body;
            const candidate = await User.findOne({username});
            if (candidate){
                res.status(400).json({message: 'Пользователь с таким именем уже существует'});
            }
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
            
        } catch (e) {
            console.log(e);
        }
    }
    async getUsers (req, res){
        try {

            res.json('server work')
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new authController();