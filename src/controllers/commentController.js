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

        const { body, type } = req.body;

        // Customer cannot create internal notes
        if (req.user.role === 'customer' && type === 'internal') {
            res.status(403);
            throw new Error('Customers cannot create internal notes');
        }

        const comment = await Comment.create({
            body,
            type: type || 'public',
            ticketId: req.params.id,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: comment
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

        res.status(200).json({
            success: true,
            data: comments
        });
    } catch (error) {
        next(error);
    }
};
