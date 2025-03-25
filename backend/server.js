import express, { Router } from "express";
import "dotenv/config";
import routerAuthore from "./router/user.routes.js";
import routerPost from "./router/post.routes.js";
import likeRouter from './router/like.routes.js';
import mongoose from "mongoose";
import cors from "cors";
import dotenv from 'dotenv';
import googleStrategy from "./middlewares/passport.config.js";
import passport from "passport";

const app = express()
passport.use(googleStrategy);
app.use((req, res, next) => {
    console.log(`🌐 ${req.method} ${req.url}`);
    next();
});


app.use(cors({
    origin: ['http://localhost:3000',
        'https://lama-blog-pi.vercel.app',
        'https://lamablog-e0tm.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use("/api", routerAuthore);
app.use("/api", routerPost);
app.use('/api', likeRouter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

mongoose.connect(process.env.MONGO_STRING)
    .then(() => console.log("Connesso a MongoDB"))
    .catch(err => console.error("Errore di connessione:", err));

mongoose.connection.on("connected", () => {
    console.log("connesso a mongoDB")
});
mongoose.connection.on("error", (err) => {
    console.log("errore di connessione a mongo", err)
});
dotenv.config();

const PORT = process.env.PORT || 5020;
app.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});