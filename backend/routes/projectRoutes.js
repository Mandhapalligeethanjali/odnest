const router = require('express').Router();
router.get('/', (req, res) => res.json({ message: 'Project routes working' }));
module.exports = router;