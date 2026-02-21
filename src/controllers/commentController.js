import Comment from '../models/comment.js';
import Ticket from '../models/Ticket.js';

export const addComment = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            res.status(404);
            throw new Error('Ticket not found');
        }

        // Permission check: Customer can only comment on own tickets
        if (req.user.role === 'customer' && ticket.createdBy.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Not authorized to comment on this ticket');
        }

        const bodyContent = req.body.body || req.body.content;
        const commentType = req.body.type || (req.body.isInternal ? 'internal' : 'public');

        // Customer cannot create internal notes
        if (req.user.role === 'customer' && commentType === 'internal') {
            res.status(403);
            throw new Error('Customers cannot create internal notes');
        }

        const comment = await Comment.create({
            body: bodyContent,
            type: commentType,
            ticketId: req.params.id,
            createdBy: req.user.id
        });

        res.status(201).json({
            id: comment._id,
            ...comment._doc,
            content: comment.body,
            isInternal: comment.type === 'internal',
            authorId: req.user._id,
            authorName: req.user.username,
            authorRole: req.user.role
        });
    } catch (error) {
        next(error);
    }
};

export const getComments = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            res.status(404);
            throw new Error('Ticket not found');
        }

        // Customer can only see own tickets
        if (req.user.role === 'customer' && ticket.createdBy.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Not authorized to access these comments');
        }

        let query = { ticketId: req.params.id };

        // Customer cannot see internal notes
        if (req.user.role === 'customer') {
            query.type = 'public';
        }

        const comments = await Comment.find(query)
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 });

        res.status(200).json(comments.map(c => ({
            id: c._id,
            ...c._doc,
            content: c.body,
            isInternal: c.type === 'internal',
            authorId: c.createdBy?._id || c.createdBy,
            authorName: c.createdBy?.username || 'Unknown',
            authorRole: c.createdBy?.role || 'user'
        })));
    } catch (error) {
        next(error);
    }
};
