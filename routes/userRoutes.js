import express from 'express';
const router = express.Router();

router.get('/profile', (req, res) => {
    res.send('User Profile');
});

export default router;
