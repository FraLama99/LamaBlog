import { Router } from "express";
import Author from "../modelli/authors.js";
import BlogPost from "../modelli/blogPost.js";
import verifyToken from '../middlewares/authMidd.js';
import uploadCloudinary from "../middlewares/uploadCloudinary.js";

const routerPost = Router()

routerPost.get('/blogPost', verifyToken, async (request, response) => {
    console.log('Request user:', request.user);
    try {
        const page = request.query.page || 1;
        let perPage = request.query.perPage || 9;
        if (perPage > 9) perPage = 9;

        const totalPosts = await BlogPost.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        const blogPosts = await BlogPost.find()
            .populate({
                path: 'author',
                select: 'name surname email avatar'
            })
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage);

        response.status(200).send({
            page,
            perPage,
            totalPages,
            totalResources: totalPosts,
            data: blogPosts
        });
    }
    catch (error) {
        response.status(500).send({ message: error.message });
    }
})

routerPost.get('/blogPost/:blogId', async (request, response) => {
    try {
        const blogPost = await BlogPost.findById(request.params.blogId)
            .populate('author')
            .populate({
                path: 'comments.user',
                select: 'name surname email avatar'
            });

        if (!blogPost) {
            return response.status(404).send({ message: 'BlogPost not found' });
        }
        response.status(200).send(blogPost);
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
});


routerPost.post('/blogPost', verifyToken, uploadCloudinary.single('cover'), async (request, response) => {
    try {
        const { category, title, readTime, author, content } = request.body;
        const cover = request.file?.path || null;


        console.log('Request body:', request.body);

        if (!author) {
            return response.status(400).send({
                message: 'Author ID is required',
                statusCode: 400
            });
        }

        const newBlogPost = new BlogPost({
            category,
            title,
            cover,
            readTime: JSON.parse(readTime),
            author,
            content
        });

        await newBlogPost.save();

        const populatedPost = await BlogPost.findById(newBlogPost._id)
            .populate('author', 'name surname email avatar');

        response.status(201).send({
            message: 'Post creato con successo',
            post: populatedPost,
            statusCode: 201
        });
    } catch (error) {
        console.error('Server error:', error);
        response.status(500).send({
            message: error.message,
            statusCode: 500
        });
    }
});

routerPost.put('/blogPost/:blogId', verifyToken, async (request, response) => {
    try {
        const { category, title, cover, readTime, author, content } = request.body;
        const updatedBlogPost = await BlogPost.findByIdAndUpdate(
            request.params.blogId,
            { category, title, cover, readTime, author, content },
            { new: true }
        );
        if (!updatedBlogPost) {
            return response.status(404).send({ message: 'BlogPost not found' });
        }
        response.status(200).send(updatedBlogPost);
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
})

routerPost.delete('/blogPost/:blogId', verifyToken, async (request, response) => {
    try {
        const deletedBlogPost = await BlogPost.findByIdAndDelete(request.params.blogId);
        if (!deletedBlogPost) {
            return response.status(404).send({ message: 'BlogPost not found' });
        }
        response.status(200).send({ message: 'BlogPost deleted successfully' });
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
})

routerPost.patch('/blogPost/:blogId/cover', verifyToken, uploadCloudinary.single('cover'), async (request, response, next) => {
    try {
        const blogPost = await BlogPost.findById(request.params.blogId);
        if (!blogPost) {
            return response.status(404).send({ message: 'BlogPost not found' });
        }
        else {
            const cover = request.file?.path || null;
            blogPost.cover = cover;
            await blogPost.save();
            response.status(200).send(blogPost);
        }
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
});


routerPost.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message || 'Errore interno del server';

    console.error('Error:', error);

    res.status(status).json({
        success: false,
        message: message
    });
});



routerPost.get('/blogPost/:blogId/comments', verifyToken, async (request, response) => {
    try {
        const blogPost = await BlogPost.findById(request.params.blogId)
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'name surname email'
                }
            });

        if (!blogPost) {
            return response.status(404).send({ message: 'BlogPost not found' });
        }
        response.status(200).send(blogPost.comments);
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
});

routerPost.get('/blogPost/:blogId/comments/:commentId', verifyToken, async (request, response) => {
    try {
        const blogPost = await BlogPost.findById(request.params.blogId);
        if (!blogPost) {
            return response.status(404).send({ message: 'BlogPost not found' });
        }

        const comment = blogPost.comments.id(request.params.commentId);
        if (!comment) {
            return response.status(404).send({ message: 'Comment not found' });
        }

        response.status(200).send(comment);
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
});


routerPost.post('/blogPost/:blogId/comments', verifyToken, async (request, response) => {
    try {
        const { text, user } = request.body;
        const blogPost = await BlogPost.findById(request.params.blogId);

        if (!blogPost) {
            return response.status(404).send({ message: 'BlogPost not found' });
        }

        blogPost.comments.push({
            text,
            user,
            date: new Date()
        });

        await blogPost.save();


        const savedPost = await BlogPost.findById(blogPost._id)
            .populate('author')
            .populate({
                path: 'comments.user',
                select: 'name surname email avatar'
            });

        response.status(201).send(savedPost);
    } catch (error) {
        console.error('Errore durante l\'aggiunta del commento:', error);
        response.status(500).send({ message: error.message });
    }
});

routerPost.put('/blogPost/:blogId/comments/:commentId', verifyToken, async (request, response) => {
    try {
        const { content } = request.body;
        const blogPost = await BlogPost.findById(request.params.blogId);

        if (!blogPost) {
            return response.status(404).send({ message: 'BlogPost not found' });
        }

        const comment = blogPost.comments.id(request.params.commentId);
        if (!comment) {
            return response.status(404).send({ message: 'Comment not found' });
        }

        comment.text = content;
        await blogPost.save();

        const updatedPost = await BlogPost.findById(request.params.blogId)
            .populate('author')
            .populate({
                path: 'comments.user',
                select: 'name surname email avatar'
            });

        response.status(200).send(updatedPost);
    } catch (error) {
        console.error('Errore durante la modifica del commento:', error);
        response.status(500).send({ message: error.message });
    }
});

routerPost.delete('/blogPost/:blogId/comments/:commentId', verifyToken, async (request, response) => {
    try {
        const blogPost = await BlogPost.findById(request.params.blogId);

        if (!blogPost) {
            return response.status(404).send({ message: 'BlogPost not found' });
        }

        blogPost.comments.pull({ _id: request.params.commentId });
        await blogPost.save();

        const updatedPost = await BlogPost.findById(request.params.blogId)
            .populate('author')
            .populate({
                path: 'comments.user',
                select: 'name surname email avatar'
            });

        response.status(200).send({
            message: 'Comment deleted successfully',
            blogPost: updatedPost
        });
    } catch (error) {
        console.error('Errore durante l\'eliminazione del commento:', error);
        response.status(500).send({ message: error.message });
    }
});


export default routerPost;