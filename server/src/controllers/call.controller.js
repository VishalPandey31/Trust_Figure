import Call from "../models/call.js";

export const saveCallHistory = async (req, res) => {
    try {
        const { receiver, type, status, startedAt, endedAt } = req.body;

        if (!receiver || !type || !status) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const duration = startedAt && endedAt 
            ? Math.floor((new Date(endedAt) - new Date(startedAt)) / 1000) 
            : 0;

        const newCall = await Call.create({
            caller: req.user._id,
            receiver,
            type,
            status,
            startedAt,
            endedAt,
            duration,
        });

        res.status(201).json(newCall);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCallHistory = async (req, res) => {
    try {
        const calls = await Call.find({
            $or: [{ caller: req.user._id }, { receiver: req.user._id }]
        })
        .populate("caller", "fullName username avatar")
        .populate("receiver", "fullName username avatar")
        .sort({ createdAt: -1 });

        res.status(200).json(calls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
