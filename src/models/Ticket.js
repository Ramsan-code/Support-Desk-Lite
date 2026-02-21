import mongoose from "mongoose"; 
const ticketSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        minlength:[5],
        maxlength:[200]
    },
    description:{
        type:String,
        required:true,
        minlength:[10],
        maxlength:[5000]
    },
    priority:{
        enum:["Low","Medium","High"],
        required:true
    },
    status:{
        enum:["open", "in_progress", "resolved","closed"],
        default:"open"
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    tags:{
        type:[String],
        default:[]
    },
  timestamps:true
});
export default mongoose.model("Ticket",ticketSchema);