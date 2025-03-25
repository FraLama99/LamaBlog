import GoogleStrategy from 'passport-google-oauth20';
import Author from '../modelli/authors.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mailer from '../middlewares/mailer.js';

const googleStrategy = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
            process.env.BACKEND_HOST + process.env.GOOGLE_CALLBACK_PATH,
    },

    async function (accessToken, refreshToken, profile, done) {
        try {

            const existingAuthor = await Author.findOne({ email: profile.emails[0].value });

            if (existingAuthor) {

                existingAuthor.jwtToken = jwt.sign(
                    { id: existingAuthor._id },
                    process.env.JWT_SECRET,
                    { expiresIn: "1 day" }
                );
                return done(null, existingAuthor);
            }


            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            const newAuthor = new Author({
                name: profile.name.givenName || profile.displayName.split(" ")[0],
                surname: profile.name.familyName || profile.displayName.split(" ").slice(1).join(" "),
                email: profile.emails[0].value,
                birth_date: new Date(),
                avatar: profile.photos[0]?.value || null,
                password: hashedPassword
            });

            const savedAuthor = await newAuthor.save();


            try {
                await mailer.sendMail({
                    from: 'info@3dlama.it',
                    to: savedAuthor.email,
                    subject: 'Benvenuto su LamaBlog',
                    text: `Benvenuto ${savedAuthor.name} ${savedAuthor.surname}! Grazie per esserti registrato con Google.`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 5px;">
                            <h2 style="color: #4285f4;">Benvenuto su LamaBlog!</h2>
                            <p>Ciao <strong>${savedAuthor.name} ${savedAuthor.surname}</strong>,</p>
                            <p>Grazie per esserti registrato tramite Google. Il tuo account è stato creato con successo.</p>
                            <p>Puoi ora accedere a tutte le funzionalità del nostro blog.</p>
                            <p>Cordiali saluti,<br>Il team di LamaBlog</p>
                        </div>
                    `,
                });
                console.log(`Email di benvenuto inviata a ${savedAuthor.email}`);
            } catch (emailError) {
                console.error('Errore nell\'invio dell\'email di benvenuto:', emailError);

            }


            savedAuthor.jwtToken = jwt.sign(
                { id: savedAuthor._id },
                process.env.JWT_SECRET,
                { expiresIn: "1 day" }
            );

            return done(null, savedAuthor);
        } catch (error) {
            console.error('Errore durante il login con Google:', error);
            return done(error);
        }
    }
);

export default googleStrategy;
