import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    console.log('⭐ Middleware verifyToken iniziato');

    const authHeader = req.header('Authorization');
    console.log('🔑 Auth Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ Header non valido');
        return res.status(401).json({
            message: 'Per accedere a questa pagina devi effettuare il login o registrarti',
            requireAuth: true,
            statusCode: 401
        });
    }

    try {
        const token = authHeader.split(' ')[1];
        console.log('🎫 Token estratto:', token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('🔓 Token decodificato:', decoded);

        req.user = { id: decoded.id };
        console.log('👤 ID utente salvato in req.user:', req.user);

        next();
    } catch (error) {
        console.log('❌ Errore verifica token:', error.message);
        res.status(403).json({
            message: 'Token non valido o scaduto',
            requireAuth: true,
            statusCode: 403
        });
    }
};

export default verifyToken;