const router = require('express').Router();
const orderCtrl = require('../controllers/orderCtrl.js');
const auth = require('../middleware/auth.js');

router.post('/', auth, orderCtrl.createOrder);
router.get('/all', orderCtrl.getOrdersInStore);
router.get('/', auth, orderCtrl.getOrderUser);
router.put('/:orderId', orderCtrl.updateStatusOrder);
router.delete('/:orderId', orderCtrl.deleteOrder);


module.exports = router;
