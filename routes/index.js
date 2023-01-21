const express = require('express');
const adminRouter = require('./user.route');
const router = express.Router();

// module.exports = () => {
//     app.use("/api/v1//admin", 
//     // Util.guestMiddleAuthorize,
//     adminRoute);
// }

router.use('/admin', adminRouter);
// router.use('/admin/product', productRouter);
// router.use('/admin/productType', productTypeRouter);


module.exports = router;
