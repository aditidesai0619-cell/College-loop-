import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { DEPARTMENTS } from '../config/constants.js';

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const userResponse = async (user) => {
  const populated = await User.findById(user._id).populate('club', 'name');
  return { _id: populated._id, name: populated.name, email: populated.email, role: populated.role, department: populated.department, club: populated.club };
};

// POST /api/auth/register  (public self-registration is for students only)
export const register = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;
    if (!name || !email || !password || !department) {
      return res.status(400).json({ message: 'Name, email, password and department are required' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Please enter a valid email' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (!DEPARTMENTS.includes(department)) return res.status(400).json({ message: 'Invalid department' });

    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password, department, role: 'student' });
    res.status(201).json({ token: signToken(user._id), user: await userResponse(user) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ token: signToken(user._id), user: await userResponse(user) });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const me = async (req, res, next) => {
  try {
    res.json({ user: await userResponse(req.user) });
  } catch (err) {
    next(err);
  }
};
