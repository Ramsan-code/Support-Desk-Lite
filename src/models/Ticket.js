import mongoose from "mongoose";
const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'required'],
        minlength: [5],
        maxlength: [200]
    },
    description: {
        type: String,
        required: [true, 'required'],
        minlength: [10],
        maxlength: [5000]
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        required: true,
        set: v => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
    },
    status: {
        type: String,
        enum: ["open", "in_progress", "resolved", "closed"],
        default: "open",
        lowercase: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    tags: {
        type: [String],
        default: []
    },
}, {
    timestamps: true
});

ticketSchema.index({ title: 'text', description: 'text' });

export default mongoose.model("Ticket", ticketSchema);