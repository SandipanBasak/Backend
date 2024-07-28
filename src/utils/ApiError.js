class ApiError extends Error{
    constructor(
        message= "Something went wrong",
        statuscode,
        errors= [],
        stack= ""
    ){
        super(message);
        this.statuscode = statuscode;
        this.data= null;
        this.error = error;
        this.stack = stack;
        this.success =false;
        this.errors = errors

        if(stack){
            this.stack =stack
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError }
