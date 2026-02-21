import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    body: {
        type: String,
        required: [true, 'required'],
    },
    type: {
        type: String,
        enum: {
            values: ['public', 'internal'],
            message: 'Comment type must be public or internal',
        },
        default: 'public',
    },
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

export default mongoose.model('Comment', commentSchema);
