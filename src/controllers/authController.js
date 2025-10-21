const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const { getVerificationEmailTemplate, getWelcomeEmailTemplate } = require('../utils/emailTemplates');

/**
 * Authentication Controller
 * Handles user registration, login, and token management
 */

const authController = {
    /**
     * Register a new user
     * POST /api/auth/register
     * Body: { email, password }
     */
    register: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields',
                    message: 'Email and password are required'
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid email',
                    message: 'Please provide a valid email address'
                });
            }

            // Validate password strength (min 8 characters)
            if (password.length < 8) {
                return res.status(400).json({
                    success: false,
                    error: 'Weak password',
                    message: 'Password must be at least 8 characters long'
                });
            }

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: 'User already exists',
                    message: 'An account with this email already exists'
                });
            }

            // Hash password
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            // Generate verification token
            const verification_token = crypto.randomBytes(32).toString('hex');
            const verification_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Create user
            const newUser = await User.create({
                email,
                password_hash,
                verification_token,
                verification_token_expires
            });

            // Generate verification link
            const verificationLink = `${process.env.BASE_URL || 'http://localhost:3000'}/verify-email?token=${verification_token}`;

            // Send verification email in background (non-blocking)
            sendEmail({
                to: email,
                subject: 'Verify Your Email - SubSentry',
                html: getVerificationEmailTemplate(verificationLink, email)
            }).catch(emailError => {
                console.error('Failed to send verification email:', emailError);
                // Don't fail registration if email fails
            });

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: newUser.id,
                    email: newUser.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
                }
            );

            // Return success response
            res.status(201).json({
                success: true,
                message: 'User registered successfully. Please check your email to verify your account.',
                data: {
                    token,
                    user: {
                        id: newUser.id,
                        email: newUser.email,
                        is_verified: false,
                        created_at: newUser.created_at
                    }
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            next(error);
        }
    },

    /**
     * Login user
     * POST /api/auth/login
     * Body: { email, password }
     */
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing credentials',
                    message: 'Email and password are required'
                });
            }

            // Find user by email
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials',
                    message: 'Email or password is incorrect'
                });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials',
                    message: 'Email or password is incorrect'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
                }
            );

            // Return success response
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        created_at: user.created_at
                    }
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            next(error);
        }
    },

    /**
     * Get current authenticated user
     * GET /api/auth/me
     * Requires authentication
     */
    getCurrentUser: async (req, res, next) => {
        try {
            // req.user is attached by authenticate middleware
            const user = await User.findById(req.user.userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    message: 'User profile not found'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        is_verified: user.is_verified,
                        created_at: user.created_at,
                        updated_at: user.updated_at
                    }
                }
            });
        } catch (error) {
            console.error('Get current user error:', error);
            next(error);
        }
    },

    /**
     * Logout user
     * POST /api/auth/logout
     * Requires authentication
     * Note: With JWT, logout is primarily client-side (remove token)
     */
    logout: async (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Logout successful',
            note: 'Please remove the token from client storage'
        });
    },

    /**
     * Change user password
     * PUT /api/auth/change-password
     * Body: { currentPassword, newPassword }
     * Requires authentication
     */
    changePassword: async (req, res, next) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.userId;

            // Validate input
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields',
                    message: 'Current password and new password are required'
                });
            }

            // Validate new password strength
            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    error: 'Weak password',
                    message: 'New password must be at least 8 characters long'
                });
            }

            // Get user with password hash
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    message: 'User not found'
                });
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid password',
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const saltRounds = 10;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // Update password
            await User.update(userId, { password_hash: newPasswordHash });

            res.status(200).json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Change password error:', error);
            next(error);
        }
    },

    /**
     * Verify email address
     * GET /api/auth/verify-email/:token
     */
    verifyEmail: async (req, res, next) => {
        try {
            const { token } = req.params;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing token',
                    message: 'Verification token is required'
                });
            }

            // Verify the token and update user
            const user = await User.verifyEmail(token);

            if (!user) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid or expired token',
                    message: 'The verification link is invalid or has expired. Please request a new one.'
                });
            }

            // Send welcome email in background (non-blocking)
            const dashboardLink = `${process.env.BASE_URL || 'http://localhost:3000'}/dashboard`;
            sendEmail({
                to: user.email,
                subject: 'Welcome to SubSentry! 🎉',
                html: getWelcomeEmailTemplate(user.email, dashboardLink)
            }).then(() => {
                console.log(`✅ Welcome email sent to ${user.email}`);
            }).catch(emailError => {
                console.error('Failed to send welcome email:', emailError);
            });

            res.status(200).json({
                success: true,
                message: 'Email verified successfully! You can now access all features.',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        is_verified: true
                    }
                }
            });
        } catch (error) {
            console.error('Verify email error:', error);
            next(error);
        }
    },

    /**
     * Resend verification email
     * POST /api/auth/resend-verification
     * Body: { email }
     */
    resendVerification: async (req, res, next) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing email',
                    message: 'Email address is required'
                });
            }

            // Find user
            const user = await User.findByEmail(email);
            if (!user) {
                // Don't reveal if email exists
                return res.status(200).json({
                    success: true,
                    message: 'If an account exists with this email, a verification link has been sent.'
                });
            }

            // Check if already verified
            if (user.is_verified) {
                return res.status(400).json({
                    success: false,
                    error: 'Already verified',
                    message: 'This email address is already verified.'
                });
            }

            // Generate new verification token
            const verification_token = crypto.randomBytes(32).toString('hex');
            const verification_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Update user with new token
            await User.update(user.id, {
                verification_token,
                verification_token_expires
            });

            // Generate verification link
            const verificationLink = `${process.env.BASE_URL || 'http://localhost:3000'}/verify-email?token=${verification_token}`;

            // Send verification email in background (non-blocking)
            sendEmail({
                to: email,
                subject: 'Verify Your Email - SubSentry',
                html: getVerificationEmailTemplate(verificationLink, email)
            }).then(() => {
                console.log(`✅ Verification email sent to ${email}`);
            }).catch(emailError => {
                console.error('Failed to send verification email:', emailError);
            });

            res.status(200).json({
                success: true,
                message: 'Verification email sent. Please check your inbox.'
            });
        } catch (error) {
            console.error('Resend verification error:', error);
            next(error);
        }
    }
};

module.exports = authController;
