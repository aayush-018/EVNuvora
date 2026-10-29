import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { NotFoundError } from '../utils/errors';

export class UserController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRes = await query(
        `SELECT u.id, u.email, u.phone, u.role, u.is_verified, u.created_at,
                p.full_name, p.avatar_url, p.bio, p.city, p.state, p.pincode
         FROM users u
         LEFT JOIN user_profiles p ON p.user_id = u.id
         WHERE u.id = $1`,
        [userId]
      );

      if (userRes.rows.length === 0) {
        throw new NotFoundError('User not found');
      }

      const user = userRes.rows[0];
      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          fullName: user.full_name,
          avatarUrl: user.avatar_url,
          bio: user.bio,
          city: user.city,
          state: user.state,
          pincode: user.pincode,
          role: user.role,
          isVerified: user.is_verified,
          createdAt: user.created_at,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { fullName, bio, city, state, pincode } = req.body;

      const profileRes = await query(
        `UPDATE user_profiles
         SET full_name = COALESCE($1, full_name),
             bio = COALESCE($2, bio),
             city = COALESCE($3, city),
             state = COALESCE($4, state),
             pincode = COALESCE($5, pincode),
             updated_at = NOW()
         WHERE user_id = $6
         RETURNING full_name, bio, city, state, pincode`,
        [fullName, bio, city, state, pincode, userId]
      );

      res.json({
        success: true,
        data: profileRes.rows[0],
      });
    } catch (err) {
      next(err);
    }
  }
}
