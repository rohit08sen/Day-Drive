const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(res, req, next))
    .catch((err)=>next(err))
  }
}
 export {asyncHandler}