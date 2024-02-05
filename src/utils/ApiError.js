
class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        stack=""
    ){
        super(message);
        this.statusCode=statusCode; // override status code
        this.data=null; // why?
        this.errors=errors;
        this.success=false;
        this.message=message;

        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError};