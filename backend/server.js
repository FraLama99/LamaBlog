import express, { Router } from "express";
import "dotenv/config";
import routerAuthore from "./router/user.routes.js";
import routerPost from "./router/post.routes.js";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from 'dotenv';

/* import items from "./modelli/items.js"; */

const app = express()
app.use((req, res, next) => {
    console.log(`🌐 ${req.method} ${req.url}`);
    next();
});
app.use(cors({
    origin: ['http://localhost:3000', // URL del tuo frontend React
        'https://lama-blog-pi.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use("/api", routerAuthore);
app.use("/api", routerPost);  // aggiungi un prefisso per le route
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

mongoose.connect(process.env.MONGO_STRING)  // rimuovi le opzioni deprecate
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