# Learn Mongodb aggregation pipelines

mongodb aggregation pipeline consist of one or more stages that process document, it can return results for group of documents

each stage performs operation on input documents

the documents that are output from a stage are passed to the next stage

```js
db.orders.aggregate([
  //stage 1
  {},
  //stage 2
  {},
  ...//stage n
  {},
]);
```

joining books(which has author_id) collection to author collection

```js
[
  {
    // join
    $lookup: {
      from: "authors", // from which collection
      localField: "author_id",
      foreignField: "_id",
      as: "author_details", // store object in this var
      // usually array is returned
    },
  },
  {
    $addFields: {
      // add field to the document
      author_details: {
        // using the variable as a field
        $first: "$author_details",
      },
    },
  },
];
```

Aggregate pipelines return us the array

$lookup => look for fiels and store it as variable as an **ARRAY**

$size => reutrn size of object/array

$cond => if , then and else

$in : [attribute,field] => if attribute present in the fild or not

$project => project or provide only selected fields to the frontend

in user.controller.js add this function

```js
const getUserChannelProfile = asyncHandler( async(req,res)=>{

    // step 1: get the username of channel with the help of url
    const { userName } = req.params

    if(!userName?.trim()){
        throw new ApiError(400,"username is missing");
    }

    // step 2: write the aggregate pipelines in oerder to calculate 1. the subcribers of channel 2.all channels subscribed by the user
    const channel = await User.aggregate([
        {
            // stage 1 : for matching all documents that contains same username as provided.
            $match :{
                userName : userName?.toLowercase()
            }
        },
        {
            // stage 2 : joins the documents in order to calculate the count of subcribers for a channel
            $lookup:{   // it is used in order to join the documents
                form :"subcriptions",
                localField:"_id",
                foreignField:"channel",
                as :"subcribers"
            }
        },
        {
            // stage 3: joins the documents in order to calculate the count of channels that is subcribed by the user
            $lookup:{
                form:"subcriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subcribedTo"
            }
        },
        {
            // stage 4: the stage is for adding fields to the responce(DB) as the subscribers count and subcribedTo count 
            $addFields:{

                subcribersCount:{
                    $size:"subcribers"
                },

                ChannelsSubcribedToCount:{
                    $size:"subcribedTO"
                },

                isSubcribed:{
                    $cond: {
                        if : { $in: [req.user?._id ,  "$subcribers.subcriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            // stage 5: for return responce
            $project :{
                fullName : 1,
                userName : 1,
                email : 1,
                avatar : 1,
                coverImage : 1,
                subcribersCount : 1,
                ChannelsSubcribedToCount : 1,
                isSubcribed : 1
            }
        }
    ]);
    
    if(!channel?.length){
        throw new ApiError(404,"channel deos not exit");
    }

    return res
    .status(200)
    .json ( new ApiResponce(200,channel[0],"the channel fetched successfully!"));
        
});
```