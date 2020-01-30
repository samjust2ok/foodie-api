exports.errorHandler = (error,errorMessage)=>{
    return {
        message:errorMessage,
        error,
    }
}