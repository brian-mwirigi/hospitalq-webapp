import bcrypt from 'bcryptjs'
import User from './models/User.js'
import { generateToken, asyncHandler } from './helpers.js'

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

function badLogin(res, message) {
  return res.status(400).json({
    success: false,
    message: message,
    error: 'MISSING_FIELDS',
  })
}

export const login = asyncHandler(async (req, res) => {
  const body = req.body

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return badLogin(res, 'Email and password are required.')
  }

  const email = body.email
  const password = body.password

  if (email === undefined || email === null || password === undefined || password === null) {
    return badLogin(res, 'Email and password are required.')
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return badLogin(res, 'Email and password must be text.')
  }

  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail || !password.trim()) {
    return badLogin(res, 'Email and password are required.')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return badLogin(res, 'Email is not a valid email.')
  }

  const user = await User.findOne({
    email: cleanEmail,
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
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department ? String(user.department) : null,
      },
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
