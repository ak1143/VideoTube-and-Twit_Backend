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

export const subcription=mongoose.model("subcription",subcriptionschema);