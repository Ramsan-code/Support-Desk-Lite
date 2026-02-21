import Ticket from "../models/Ticket.js";
import Comment from "../models/comment.js";

export const getTickets = async (req, res, next) => {
    try {
        let queryObj = {};

        // 1. Role-based access control
        if (req.user.role === 'customer') {
            queryObj.createdBy = req.user.id;
        }

        // 2. Text Search
        if (req.query.search) {
            queryObj.$text = { $search: req.query.search };
        }

        // 3. Filters
        if (req.query.status) queryObj.status = req.query.status;
        if (req.query.priority) queryObj.priority = req.query.priority.charAt(0).toUpperCase() + req.query.priority.slice(1).toLowerCase();
        if (req.query.tag) queryObj.tags = req.query.tag;

        // 4. Date Range Filter
        if (req.query.from || req.query.to) {
            queryObj.createdAt = {};
            if (req.query.from) queryObj.createdAt.$gte = new Date(req.query.from);
            if (req.query.to) queryObj.createdAt.$lte = new Date(req.query.to);
        }

        // 5. Pagination & Sorting
        const page = parseInt(req.query.page, 10) || 1;
        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
        const skip = (page - 1) * limit;

        const total = await Ticket.countDocuments(queryObj);
        const pages = Math.ceil(total / limit);

        const tickets = await Ticket.find(queryObj)
            .sort({ createdAt: -1 }) // Default sort newest first
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'username email')
            .populate('assignedTo', 'username email');

        res.status(200).json({
            tickets: tickets.map(t => ({
                id: t._id,
                ...t._doc
            })),
            page,
            limit,
            total,
            totalPages: pages
        });
    } catch (error) {
        next(error);
    }
};

export const getTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('createdBy', 'username email')
            .populate('assignedTo', 'username email');

        if (!ticket) {
            res.status(404);
            throw new Error("Ticket not found");
        }

        // Customer can only see their own tickets
        if (req.user.role === 'customer' && ticket.createdBy._id.toString() !== req.user.id) {
            res.status(401);
            throw new Error("Not authorized to access this ticket");
        }

        // Fetch comments
        let commentQuery = { ticketId: req.params.id };
        // Customer cannot see internal notes
        if (req.user.role === 'customer') {
            commentQuery.type = 'public';
        }

        const comments = await Comment.find(commentQuery)
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            id: ticket._id,
            ...ticket._doc,
            ownerId: ticket.createdBy?._id || ticket.createdBy,
            ownerName: ticket.createdBy?.username || 'Unknown',
            assigneeId: ticket.assignedTo?._id || ticket.assignedTo,
            assigneeName: ticket.assignedTo?.username || 'Unassigned',
            comments: comments.map(c => ({
                id: c._id,
                ...c._doc,
                authorId: c.createdBy?._id || c.createdBy,
                authorName: c.createdBy?.username || 'Unknown',
                authorRole: c.createdBy?.role || 'user',
                content: c.body,
                isInternal: c.type === 'internal'
            }))
        });
    } catch (error) {
        next(error);
    }
};

export const createTicket = async (req, res, next) => {
    try {
        req.body.createdBy = req.user.id;

        // Ensure initial status is open
        delete req.body.status;

        const ticket = await Ticket.create(req.body);

        res.status(201).json({
            id: ticket._id,
            ...ticket._doc
        });
    } catch (error) {
        next(error);
    }
};

export const updateTicket = async (req, res, next) => {
    try {
        let ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            res.status(404);
            throw new Error("Ticket not found");
        }

        // 1. Ownership/Permission check
        if (req.user.role === 'customer' && ticket.createdBy.toString() !== req.user.id) {
            res.status(401);
            throw new Error("Not authorized to update this ticket");
        }

        // 2. Status Transition Validation
        if (req.body.status && req.body.status !== ticket.status) {
            const from = ticket.status;
            const to = req.body.status;

            const validTransitions = {
                'open': ['in-progress'],
                'in-progress': ['resolved'],
                'resolved': ['closed', 'in-progress'],
                'closed': []
            };

            if (!validTransitions[from].includes(to)) {
                res.status(400);
                throw new Error(`Invalid status transition from ${from} to ${to}`);
            }

            // Only Agent/Admin can change status
            if (req.user.role === 'customer') {
                res.status(403);
                throw new Error("Customers cannot change ticket status");
            }
        }

        // 3. Assignment Check
        if (req.body.assignedTo && req.user.role === 'customer') {
            res.status(403);
            throw new Error("Customers cannot assign tickets");
        }

        ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            id: ticket._id,
            ...ticket._doc
        });
    } catch (error) {
        next(error);
    }
};

export const deleteTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            res.status(404);
            throw new Error("Ticket not found");
        }

        if (req.user.role === 'customer' && ticket.createdBy.toString() !== req.user.id) {
            res.status(401);
            throw new Error("Not authorized to delete this ticket");
        }

        await ticket.deleteOne();

        res.status(200).json({
            message: "Ticket deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

