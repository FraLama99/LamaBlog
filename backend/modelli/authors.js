import mongoose, { Schema, model } from 'mongoose';
const roles = ['admin', 'user']
const authorSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
        ,
        match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    },
    birth_date: {
        type: String,
        required: true,
        validate: {
            validator: function (date) {
                return new Date(date) <= new Date();
            },
            message: 'Birth date cannot be in the future'
        },
        max: Date.now()
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: 8
    },
    avatar: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: roles,
        default: 'user'
    }
}, { collection: 'users' });

const Author = mongoose.model('Author', authorSchema);
export default Author;