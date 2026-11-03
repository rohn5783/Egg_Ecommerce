import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/Content.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { EmailService } from '../services/emailService.js';
import { AuthRequest } from '../middleware/auth.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, phone } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(ApiError.conflict('An account with this email already exists'));
      }

      // Check if this is the first user; if so, make ADMIN for effortless setup
      const isFirst = (await User.countDocuments({})) === 0;
      const role = isFirst ? 'ADMIN' : 'CUSTOMER';

      const user = await User.create({
        name,
        email,
        password,
        phone,
        role,
      });

      const accessToken = generateAccessToken({
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
      });

      const refreshToken = generateRefreshToken({
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
      });

      await RefreshToken.create({
        token: refreshToken,
        user: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      // Send welcome email in background
      EmailService.sendWelcomeEmail(user.email, user.name).catch(() => {});

      return ApiResponse.created(res, {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        accessToken,
        refreshToken,
      }, 'Account created successfully');
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user || !user.password) {
        return next(ApiError.unauthorized('Invalid email or password'));
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return next(ApiError.unauthorized('Invalid email or password'));
      }

      const accessToken = generateAccessToken({
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
      });

      const refreshToken = generateRefreshToken({
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
      });

      await RefreshToken.create({
        token: refreshToken,
        user: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return ApiResponse.success(res, {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
        },
        accessToken,
        refreshToken,
      }, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        credential,
        email: directEmail,
        name: directName,
        googleId: directGoogleId,
        avatar: directAvatar,
      } = req.body;

      let email = directEmail;
      let name = directName;
      let googleId = directGoogleId;
      let avatar = directAvatar;

      // If credential JWT string is passed from Google Identity Services
      if (credential) {
        try {
          const decoded: any = jwt.decode(credential);
          if (decoded && typeof decoded === 'object') {
            email = email || decoded.email;
            name = name || decoded.name;
            googleId = googleId || decoded.sub;
            avatar = avatar || decoded.picture;
          }
        } catch {
          // If token decoding fails, fallback to direct fields
        }
      }

      if (!email) {
        return next(ApiError.badRequest('Valid email address is required for Google Sign-In'));
      }

      email = email.toLowerCase().trim();
      name = name?.trim() || email.split('@')[0] || 'GoodEggs Customer';

      // Check if user already exists
      let user = await User.findOne({
        $or: [{ email }, ...(googleId ? [{ googleId }] : [])],
      });

      if (user) {
        let updated = false;
        if (googleId && !user.googleId) {
          user.googleId = googleId;
          updated = true;
        }
        if (avatar && !user.avatar) {
          user.avatar = avatar;
          updated = true;
        }
        if (!user.isEmailVerified) {
          user.isEmailVerified = true;
          updated = true;
        }
        if (updated) {
          await user.save();
        }
      } else {
        // First registered user becomes ADMIN for frictionless ops
        const isFirst = (await User.countDocuments({})) === 0;
        const role = isFirst ? 'ADMIN' : 'CUSTOMER';

        user = await User.create({
          name,
          email,
          googleId: googleId || `google_${Date.now().toString(36)}`,
          avatar,
          role,
          isEmailVerified: true,
        });

        // Send welcome email in background
        EmailService.sendWelcomeEmail(user.email, user.name).catch(() => {});
      }

      const accessToken = generateAccessToken({
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
      });

      const refreshToken = generateRefreshToken({
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
      });

      await RefreshToken.create({
        token: refreshToken,
        user: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return ApiResponse.success(
        res,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
          },
          accessToken,
          refreshToken,
        },
        'Signed in with Google successfully'
      );
    } catch (err) {
      next(err);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return next(ApiError.badRequest('Refresh token is required'));
      }

      const payload = verifyRefreshToken(refreshToken);
      const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
      if (!tokenDoc) {
        return next(ApiError.unauthorized('Refresh token invalid or revoked'));
      }

      // Rotate Refresh Token
      await RefreshToken.deleteOne({ _id: tokenDoc._id });

      const newAccessToken = generateAccessToken({
        userId: payload.userId,
        role: payload.role,
        email: payload.email,
      });

      const newRefreshToken = generateRefreshToken({
        userId: payload.userId,
        role: payload.role,
        email: payload.email,
      });

      await RefreshToken.create({
        token: newRefreshToken,
        user: payload.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return ApiResponse.success(res, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }, 'Tokens refreshed');
    } catch (err) {
      next(err);
    }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.userId).select('-password');
      if (!user) return next(ApiError.notFound('User not found'));
      return ApiResponse.success(res, user);
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, phone, avatar } = req.body;
      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: { ...(name && { name }), ...(phone && { phone }), ...(avatar && { avatar }) } },
        { new: true }
      ).select('-password');

      return ApiResponse.success(res, user, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async addAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const addressData = req.body;
      const user = await User.findById(req.userId);
      if (!user) return next(ApiError.notFound('User not found'));

      if (addressData.isDefault || user.addresses.length === 0) {
        user.addresses.forEach((addr) => (addr.isDefault = false));
        addressData.isDefault = true;
      }

      user.addresses.push(addressData);
      await user.save();

      return ApiResponse.created(res, user.addresses, 'Address added successfully');
    } catch (err) {
      next(err);
    }
  }

  static async deleteAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { addressId } = req.params;
      const user = await User.findById(req.userId);
      if (!user) return next(ApiError.notFound('User not found'));

      user.addresses = user.addresses.filter((a: any) => a._id.toString() !== addressId);
      if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
        user.addresses[0].isDefault = true;
      }
      await user.save();

      return ApiResponse.success(res, user.addresses, 'Address deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

