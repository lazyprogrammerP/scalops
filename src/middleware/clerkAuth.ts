import Cookies from 'cookies';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default function clerkAuth(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const publicKey = process.env.CLERK_JWT_PEM_KEY || '';
    const cookies = new Cookies(req, res);
    const sessionToken = cookies.get('__session');

    if (sessionToken === undefined) {
        res
            .status(401)
            .json({ message: 'user not signed in', status: 'fail', data: {} });

        return;
    }

    if (publicKey === '') {
        console.log('clerk jwt pem key not found');
        process.exit(1);
    }

    try {
        let decoded = jwt.verify(sessionToken, publicKey);
        console.log(decoded);
        next();
    } catch (error) {
        res.status(400).json({ message: 'invalid token', status: 'fail' });
    }
}
