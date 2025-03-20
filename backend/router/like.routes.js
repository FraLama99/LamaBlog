import { Router } from "express";
import Like from "../modelli/LikeSchema.js";
import BlogPost from "../modelli/blogPost.js";
import verifyToken from '../middlewares/authMidd.js';

const likeRouter = Router();

// Ottieni tutti i like per un post
likeRouter.get('/posts/:postId/likes', async (req, res) => {
    try {
        const { postId } = req.params;

        const likes = await Like.find({ post: postId })
            .populate({
                path: 'user',
                select: 'name surname email avatar'
            });

        res.status(200).send({
            count: likes.length,
            data: likes
        });
    } catch (error) {
        console.error('Errore nel recupero dei like:', error);
        res.status(500).send({ message: error.message });
    }
});

// Aggiungi o rimuovi un like (toggle)
likeRouter.post('/posts/:postId/likes/toggle', verifyToken, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id; // Ottenuto da verifyToken middleware

        // Verifica che il post esista
        const post = await BlogPost.findById(postId);
        if (!post) {
            return res.status(404).send({ message: 'Post non trovato' });
        }

        // Cerca se esiste già un like dell'utente per il post
        const existingLike = await Like.findOne({ post: postId, user: userId });

        if (existingLike) {
            // Se esiste, rimuovilo (toggle off)
            await Like.deleteOne({ _id: existingLike._id });

            // Conta i like rimanenti per il post
            const likeCount = await Like.countDocuments({ post: postId });

            return res.status(200).send({
                status: 'unliked',
                message: 'Like rimosso con successo',
                likeCount
            });
        } else {
            // Altrimenti crea un nuovo like (toggle on)
            const newLike = new Like({
                post: postId,
                user: userId
            });

            await newLike.save();

            // Conta il numero totale di like per il post
            const likeCount = await Like.countDocuments({ post: postId });

            return res.status(201).send({
                status: 'liked',
                message: 'Like aggiunto con successo',
                likeCount
            });
        }
    } catch (error) {
        console.error('Errore nella gestione del like:', error);
        res.status(500).send({ message: error.message });
    }
});

// Verifica se un utente ha messo like a un post
likeRouter.get('/posts/:postId/likes/check', verifyToken, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        const like = await Like.findOne({ post: postId, user: userId });

        res.status(200).send({
            liked: !!like
        });
    } catch (error) {
        console.error('Errore nella verifica del like:', error);
        res.status(500).send({ message: error.message });
    }
});

export default likeRouter;