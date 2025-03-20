import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogPost',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author', // o 'User' se utilizzi un modello diverso
        required: true
    }
}, { timestamps: true });

// Indice composto per garantire unicità e query efficienti
likeSchema.index({ post: 1, user: 1 }, { unique: true });

export default mongoose.model('Like', likeSchema);