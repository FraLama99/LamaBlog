import { Router } from "express";
import Like from "../modelli/LikeSchema.js";
import BlogPost from "../modelli/blogPost.js";
import verifyToken from '../middlewares/authMidd.js';

const likeRouter = Router();

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

likeRouter.post('/posts/:postId/likes/toggle', verifyToken, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        const post = await BlogPost.findById(postId);
        if (!post) {
            return res.status(404).send({ message: 'Post non trovato' });
        }

        const existingLike = await Like.findOne({ post: postId, user: userId });

        if (existingLike) {
            await Like.deleteOne({ _id: existingLike._id });

            const likeCount = await Like.countDocuments({ post: postId });

            return res.status(200).send({
                status: 'unliked',
                message: 'Like rimosso con successo',
                likeCount
            });
        } else {
            const newLike = new Like({
                post: postId,
                user: userId
            });

            await newLike.save();

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