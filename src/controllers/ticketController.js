import Ticket from "../models/Ticket.js";

export const getTickets = async (req, res) => {
    try {
        let query;

        // If user is a customer, only show their tickets
        if (req.user.role === 'customer') {
            query = Ticket.find({ createdBy: req.user.id });
        } else {
            // Agents and Admins see all tickets
            query = Ticket.find();
        }

        const tickets = await query.populate('createdBy', 'username email');

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id).populate('createdBy', 'username email');

        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        // Check if user is authorized to see this ticket
        if (req.user.role === 'customer' && ticket.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: "Not authorized to access this ticket" });
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createTicket = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;

        const ticket = await Ticket.create(req.body);

        res.status(201).json({
            success: true,
            data: ticket
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateTicket = async (req, res) => {
    try {
        let ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        // Check ownership or role
        if (req.user.role === 'customer' && ticket.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: "Not authorized to update this ticket" });
        }

        ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        // Authorized?
        if (req.user.role === 'customer' && ticket.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: "Not authorized to delete this ticket" });
        }

        await ticket.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
