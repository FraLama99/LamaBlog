import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author',
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

const BlogPostSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    cover: {
        type: String,
        required: true
    },
    readTime: {
        type: Object,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    comments: [commentSchema]
}, {
    collection: 'blogPosts',
    timestamps: true
});

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
export default BlogPost;