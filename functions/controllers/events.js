import Event from "../models/eventModel.js";

// Get all events
export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.findAll();
        res.json(events);
    } catch (error) {
        res.json({ message: error.message });
    }  
}

// Get a single event by id
export const getEventById = async (req, res) => {
    try {
        const events = await Event.findAll({
            where: {
                id: req.params.id
            }
        });
        res.json(events[0]);
    } catch (error) {
        res.json({ message: error.message });
    }  
}

// Create a new event
export const createEvent = async (req, res) => {
    try {
        await Event.create(req.body);
        res.json({
            "message": "Events Created"
        });
    } catch (error) {
        res.json({ message: error.message });
    }
}

// Update an event
export const updateEvent = async (req, res) => {
    try {
        await Event.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "Event Updated"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}

// Delete an event
export const deleteEvent = async (req, res) => {
    try {
        await Event.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "Event Deleted"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}