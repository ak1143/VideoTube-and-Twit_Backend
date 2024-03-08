import mongoose,{Schema} from "mongoose";

const subcriptionschema=new Schema({
    subcriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
    },
    {timestamps:true}
);

export const subscription=mongoose.model("subcription",subcriptionschema);