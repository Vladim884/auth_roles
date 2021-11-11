const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRoutes')
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use('/auth', authRouter);


const start = async () => {
    try {
        // qwerty123
        await mongoose.connect('mongodb+srv://qwerty:qwerty123@cluster0.8eps6.mongodb.net/auth_roles1?retryWrites=true&w=majority')
        app.listen( PORT, ()=>{console.log(`server started on ${PORT}`)});
    } catch (e) {
        console.log(e)
    }
}
start();