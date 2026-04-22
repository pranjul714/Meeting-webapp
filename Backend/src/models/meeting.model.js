import mongoose, { Schema } from "mongoose";


const meetingSchema = new Schema(
    {
        user_id: { type: String }, // Keep for legacy compatibility if needed
        hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        meetingCode: { type: String, required: true },
        title: { type: String, default: 'Untitled Meeting' },
        isLocked: { type: Boolean, default: false },
        chatHistory: [
            {
                sender: { type: String, required: true },
                data: { type: String, required: true },
                timestamp: { type: Date, default: Date.now }
            }
        ],
        date: { type: Date, default: Date.now, required: true }
    }
)

const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting };