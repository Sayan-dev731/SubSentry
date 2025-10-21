const { mongoose } = require('../utils/database');

/**
 * User Schema Definition
 * MongoDB schema for users collection
 */
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please provide a valid email address'
        }
    },
    password_hash: {
        type: String,
        required: [true, 'Password hash is required']
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    verification_token: {
        type: String,
        default: null
    },
    verification_token_expires: {
        type: Date,
        default: null
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'users'
});

// Index is created automatically by unique: true option

// Create the model
const UserModel = mongoose.model('User', userSchema);

/**
 * User Model
 * Handles all database operations for users collection
 * Schema: _id, email, password_hash, createdAt, updatedAt
 */
class User {
    /**
     * Create a new user
     * @param {Object} params - User data
     * @param {string} params.email - User email (unique)
     * @param {string} params.password_hash - Hashed password
     * @param {string} [params.verification_token] - Email verification token
     * @param {Date} [params.verification_token_expires] - Token expiration date
     * @returns {Promise<Object>} Created user object
     */
    static async create({ email, password_hash, verification_token, verification_token_expires }) {
        try {
            const user = new UserModel({
                email: email.toLowerCase(),
                password_hash,
                is_verified: false,
                verification_token: verification_token || null,
                verification_token_expires: verification_token_expires || null
            });

            await user.save();

            // Return user object without password_hash in some contexts
            return {
                id: user._id.toString(),
                _id: user._id,
                email: user.email,
                is_verified: user.is_verified,
                verification_token: user.verification_token,
                created_at: user.createdAt,
                createdAt: user.createdAt,
                updated_at: user.updatedAt,
                updatedAt: user.updatedAt
            };
        } catch (error) {
            // Handle duplicate email error
            if (error.code === 11000) {
                const duplicateError = new Error('Email already exists');
                duplicateError.code = 'DUPLICATE_EMAIL';
                throw duplicateError;
            }
            throw error;
        }
    }

    /**
     * Find a user by ID
     * @param {string} id - User ID (MongoDB ObjectId as string)
     * @returns {Promise<Object|null>} User object or null if not found
     */
    static async findById(id) {
        try {
            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return null;
            }

            const user = await UserModel.findById(id);

            if (!user) {
                return null;
            }

            return {
                id: user._id.toString(),
                _id: user._id,
                email: user.email,
                password_hash: user.password_hash,
                is_verified: user.is_verified,
                verification_token: user.verification_token,
                verification_token_expires: user.verification_token_expires,
                created_at: user.createdAt,
                createdAt: user.createdAt,
                updated_at: user.updatedAt,
                updatedAt: user.updatedAt
            };
        } catch (error) {
            console.error('Error finding user by ID:', error);
            return null;
        }
    }

    /**
     * Find a user by email
     * @param {string} email - User email
     * @returns {Promise<Object|null>} User object or null if not found
     */
    static async findByEmail(email) {
        try {
            const user = await UserModel.findOne({ email: email.toLowerCase() });

            if (!user) {
                return null;
            }

            return {
                id: user._id.toString(),
                _id: user._id,
                email: user.email,
                password_hash: user.password_hash,
                is_verified: user.is_verified,
                verification_token: user.verification_token,
                verification_token_expires: user.verification_token_expires,
                created_at: user.createdAt,
                createdAt: user.createdAt,
                updated_at: user.updatedAt,
                updatedAt: user.updatedAt
            };
        } catch (error) {
            console.error('Error finding user by email:', error);
            return null;
        }
    }

    /**
     * Find a user by verification token
     * @param {string} token - Verification token
     * @returns {Promise<Object|null>} User object or null if not found
     */
    static async findByVerificationToken(token) {
        try {
            const user = await UserModel.findOne({
                verification_token: token,
                verification_token_expires: { $gt: new Date() }
            });

            if (!user) {
                return null;
            }

            return {
                id: user._id.toString(),
                _id: user._id,
                email: user.email,
                is_verified: user.is_verified,
                created_at: user.createdAt,
                createdAt: user.createdAt,
                updated_at: user.updatedAt,
                updatedAt: user.updatedAt
            };
        } catch (error) {
            console.error('Error finding user by verification token:', error);
            return null;
        }
    }

    /**
     * Verify a user's email
     * @param {string} token - Verification token
     * @returns {Promise<Object|null>} Updated user object or null if not found
     */
    static async verifyEmail(token) {
        try {
            const user = await UserModel.findOneAndUpdate(
                {
                    verification_token: token,
                    verification_token_expires: { $gt: new Date() }
                },
                {
                    $set: {
                        is_verified: true,
                        verification_token: null,
                        verification_token_expires: null
                    }
                },
                { new: true }
            );

            if (!user) {
                return null;
            }

            return {
                id: user._id.toString(),
                _id: user._id,
                email: user.email,
                is_verified: user.is_verified,
                created_at: user.createdAt,
                createdAt: user.createdAt,
                updated_at: user.updatedAt,
                updatedAt: user.updatedAt
            };
        } catch (error) {
            console.error('Error verifying email:', error);
            return null;
        }
    }

    /**
     * Update a user
     * @param {string} id - User ID (MongoDB ObjectId as string)
     * @param {Object} updates - Fields to update
     * @param {string} [updates.email] - New email
     * @param {string} [updates.password_hash] - New password hash
     * @returns {Promise<Object|null>} Updated user object or null if not found
     */
    static async update(id, updates) {
        try {
            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return null;
            }

            const allowedFields = ['email', 'password_hash', 'is_verified', 'verification_token', 'verification_token_expires'];
            const updateData = {};

            // Build update object with only allowed fields
            for (const [key, value] of Object.entries(updates)) {
                if (allowedFields.includes(key) && value !== undefined) {
                    if (key === 'email') {
                        updateData[key] = value.toLowerCase();
                    } else {
                        updateData[key] = value;
                    }
                }
            }

            // If no valid fields to update, return current user
            if (Object.keys(updateData).length === 0) {
                return this.findById(id);
            }

            const user = await UserModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!user) {
                return null;
            }

            return {
                id: user._id.toString(),
                _id: user._id,
                email: user.email,
                created_at: user.createdAt,
                createdAt: user.createdAt,
                updated_at: user.updatedAt,
                updatedAt: user.updatedAt
            };
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    /**
     * Delete a user
     * @param {string} id - User ID (MongoDB ObjectId as string)
     * @returns {Promise<Object|null>} Deleted user object or null if not found
     */
    static async delete(id) {
        try {
            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return null;
            }

            const user = await UserModel.findByIdAndDelete(id);

            if (!user) {
                return null;
            }

            return {
                id: user._id.toString(),
                _id: user._id,
                email: user.email,
                created_at: user.createdAt,
                createdAt: user.createdAt
            };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    /**
     * Find users by multiple IDs
     * @param {Array<string>} ids - Array of user IDs (MongoDB ObjectIds as strings)
     * @returns {Promise<Array>} Array of user objects
     */
    static async findByIds(ids) {
        try {
            if (!ids || ids.length === 0) {
                return [];
            }

            // Filter valid ObjectIds
            const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));

            if (validIds.length === 0) {
                return [];
            }

            const users = await UserModel.find({ _id: { $in: validIds } });

            return users.map(user => ({
                id: user._id.toString(),
                _id: user._id,
                email: user.email,
                created_at: user.createdAt,
                createdAt: user.createdAt,
                updated_at: user.updatedAt,
                updatedAt: user.updatedAt
            }));
        } catch (error) {
            console.error('Error finding users by IDs:', error);
            return [];
        }
    }
}

// Export both the class and the mongoose model
User.Model = UserModel;

module.exports = User;
