import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'
import { asyncHandler } from '../utils/asyncHandler.js'

function cleanUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export const login = asyncHandler(async (req, res) => {
  const email = req.body.email
  const password = req.body.password

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.',
      error: 'MISSING_FIELDS',
    })
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select('+password')

  if (!user || user.isActive === false) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
      error: 'INVALID_CREDENTIALS',
    })
  }

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
      error: 'INVALID_CREDENTIALS',
    })
  }

  const token = generateToken(user._id)

  res.json({
    success: true,
    data: {
      token: token,
      user: cleanUser(user),
    },
    message: 'Login successful',
  })
})

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: cleanUser(req.user),
    },
  })
})

export const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'Logged out successfully',
  })
})
