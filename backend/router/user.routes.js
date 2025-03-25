import { Router } from "express";
import Author from "../modelli/authors.js";
import BlogPost from "../modelli/blogPost.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyToken from "../middlewares/authMidd.js";
import uploadCloudinary from "../middlewares/uploadCloudinary.js";
import mailer from "../middlewares/mailer.js";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";

const routerAuthore = Router()


routerAuthore.get('/authors', async (request, response) => {
    try {
        const authors = await Author.find();
        response.status(200).send(authors);
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
})

routerAuthore.get('/authors/me', verifyToken, async (request, response) => {
    try {
        const author = await Author.findById(request.user.id);
        if (!author) {
            return response.status(404).send({ message: 'Author not found' });
        }
        response.status(200).send(author);
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
});





routerAuthore.post('/authors', uploadCloudinary.single('avatar'), async (request, response, next) => {
    try {


        const { name, surname, email, birth_date, password } = request.body;
        const avatar = request.file?.path || null;


        if (!name || !surname || !email || !birth_date) {
            const error = new Error('Tutti i campi sono obbligatori');
            error.statusCode = 400;
            return next(error);
        }

        const newAuthor = new Author({
            name,
            surname,
            email,
            birth_date,
            avatar: avatar,
            password: await bcrypt.hash(request.body.password, 10)
        });

        const savedAuthor = await newAuthor.save();

        await mailer.sendMail({
            from: 'info@3dlama.it',
            to: request.body.email,
            subject: 'Benvenuto su LamaBlog',
            text: `Benvenuto ${request.body.name} ${request.body.surname}! Grazie per esserti registrato con Google.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #4285f4;">Benvenuto su LamaBlog!</h2>
                    <p>Ciao <strong>${request.body.name} ${request.body.surname}</strong>,</p>
                    <p>Grazie per esserti registrato tramite Google. Il tuo account è stato creato con successo.</p>
                    <p>Puoi ora accedere a tutte le funzionalità del nostro blog.</p>
                    <p>Cordiali saluti,<br>Il team di LamaBlog</p>
                </div>
            `,
        });
        return response.status(201).json(savedAuthor);

    } catch (error) {
        console.error('Errore dettagliato:', {
            message: error.message,
            stack: error.stack,
            code: error.http_code
        });
        error.statusCode = error.http_code || 500;
        return next(error);
    }
});

routerAuthore.post('/authors/login', async (request, response) => {
    try {

        const { email, password } = request.body;
        const author = await Author.findOne({ email }).select('+password');

        if (!author) {
            return response.status(404).send({ message: 'Author not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, author.password);
        if (!isPasswordValid) {
            return response.status(401).send({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: author._id }, process.env.JWT_SECRET, { expiresIn: '1 day' });
        const authorWithoutPassword = author.toObject();
        delete authorWithoutPassword.password;
        response.set('Authorization', `Bearer ${token}`);
        response.status(200).send({
            message: 'Login successful',
            token: token,
            author: authorWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        response.status(500).send({
            message: error.message,
            details: error.stack
        });
    }

});

routerAuthore.get('/authors/login-google', passport.authenticate('google', { scope: ['profile', 'email'] }));


routerAuthore.get('/authors/callback-google', passport.authenticate('google', { session: false }),

    (request, response, next) => {

        response.redirect(
            process.env.FRONTEND_HOST + '/register?token=' + request.user.jwtToken
        );
    }
);




routerAuthore.get('/authors/:userId', async (request, response) => {
    try {
        const author = await Author.findById(request.params.userId);
        if (!author) {
            return response.status(404).send({ message: 'Author not found' });
        }
        response.status(200).send(author);
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
})

routerAuthore.patch('/authors/:userId/avatar', verifyToken, uploadCloudinary.single('avatar'), async (request, response, next) => {
    try {
        const author = await Author.findById(request.params.userId);
        if (!author) {
            return response.status(404).send({ message: 'Author not found' });
        }

        const avatar = request.file?.path || null;
        author.avatar = avatar;
        await author.save();

        response.status(200).send(author);
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
});



routerAuthore.put('/authors/:userId', verifyToken, async (request, response) => {
    try {
        if (request.user.id !== request.params.userId) {
            return response.status(403).send({
                message: 'Non hai i permessi per modificare questo profilo',
                statusCode: 403
            });
        }

        const { name, surname, email, birth_date, avatar } = request.body;
        const updatedAuthor = await Author.findByIdAndUpdate(
            request.params.userId,
            { name, surname, email, birth_date, avatar },
            { new: true }
        );

        if (!updatedAuthor) {
            return response.status(404).send({
                message: 'Autore non trovato',
                statusCode: 404
            });
        }

        response.status(200).send({
            message: 'Profilo aggiornato con successo',
            author: updatedAuthor,
            statusCode: 200
        });
    } catch (error) {
        response.status(500).send({
            message: error.message,
            statusCode: 500
        });
    }
});

routerAuthore.delete('/authors/:userId', verifyToken, async (request, response) => {
    try {
        if (request.user.id !== request.params.userId) {
            return response.status(403).send({
                message: 'Non hai i permessi per eliminare questo profilo',
                statusCode: 403
            });
        }

        const deletedAuthor = await Author.findByIdAndDelete(request.params.userId);
        if (!deletedAuthor) {
            return response.status(404).send({
                message: 'Autore non trovato',
                statusCode: 404
            });
        }
        response.status(200).send({
            message: 'Profilo eliminato con successo',
            statusCode: 200
        });
    } catch (error) {
        response.status(500).send({
            message: error.message,
            statusCode: 500
        });
    }
});


routerAuthore.get('/authors/:id/blogPosts', verifyToken, async (request, response) => {
    try {
        const blogPosts = await BlogPost.find({ author: request.params.id }).populate({
            path: 'author',
            select: 'name surname email avatar'
        });
        response.status(200).send(blogPosts);
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
});


routerAuthore.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message || 'Errore interno del server';

    console.error('Error:', error);

    res.status(status).json({
        success: false,
        message: message
    });
});

export default routerAuthore; 