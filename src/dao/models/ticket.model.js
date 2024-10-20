//Modelo de tickets
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        default: () => Math.random().toString(36).substr(2, 9).toUpperCase()
    },
    purchase_datetime: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        require: true
    },
    purchaser: {
        type: String,
        require: true
    }
});

const ticketModel = mongoose.model('Ticket', ticketSchema);

export default ticketModel;