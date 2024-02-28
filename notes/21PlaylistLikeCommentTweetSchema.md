comment.model.js
```js
import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema (
    {
       content :{
            type : String,
            required :true
       },
       video :{
            type : Schema.Types.ObjectId,
            ref : 'Video',
            required : true
       },
       owner :{
            type : Schema.Types.ObjectId,
            ref : 'User',
            required : true
       } 
    },
    { 
        timestamps : true 
    }
);


// primary purpose of this plugin is to enable pagination when using MongoDB's aggregation framework for querying the "videos" collection.
//  introduces the paginate() method, allowing you to perform paginated aggregations on the "videos" collection.
commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment",commentSchema);
```

like.model.js
```js
import mongoose,{Schema} from "mongoose";

const likeschema = new Schema (
    {
        comment :{
            type : Schema.Types.ObjectId,
            ref : 'Comment'
        },
        video :{
            type : Schema.Types.ObjectId,
            ref : 'Video'
        },
        likedBy :{
            type : Schema.Types.ObjectId,
            ref : 'User'
        },
        tweet :{
            type : Schema.Types.ObjectId,
            ref : 'Tweet'
        }
    },
    {
        timestamps : true
    }
);

export const Like = mongoose.model("Like",likeschema);
```

playlist model - 
```js
import mongoose,{Schema} from "mongoose";

const playlistschema =new Schema(
    {
        name :{
            type :String,
            required :true
        },
        description :{
            type : String,
            required :true
        },
        video :[
            {
                type : Schema.Types.ObjectId,
                ref : 'Video',
            }
        ],
        owner :{
            type :Schema.Types.ObjectId,
            ref : 'User'
        }
    },
    {
        timestamps : true
    }
);

export const PlayList = mongoose.model("PlayList",playlistschema);
```

tweet model.js
```js
import mongoose,{Schema} from "mongoose";

const tweetschema = new Schema (
    {
        content :{
            type :String,
            requried : true
        },
        owner :{
            type : Schema.Types.ObjectId,
            ref : 'User'
        }
    },
    {
        timestamps :true
    }
)

export const Tweet = mongoose.model("Tweet",tweetschema);
```