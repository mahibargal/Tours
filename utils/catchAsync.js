module.exports = fn=>{
    return(req,res,next)=>{
        fn(req,res,next).catch(err=>{
            debugger;
            console.log(err);
            next(err);
        })
    }
}