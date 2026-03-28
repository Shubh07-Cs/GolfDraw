import { supabaseAdmin } from '../config/database.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';

export async function register(req, res, next) {
  try {
    const validated = registerSchema.parse(req.body);

    const { data, error } = await supabaseAdmin.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          full_name: validated.full_name,
        },
        emailRedirectTo: undefined,
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Check if email confirmation is required
    const needsConfirmation = data.user && !data.session;

    res.status(201).json({
      message: needsConfirmation
        ? 'Registration successful! Please check your email to confirm your account.'
        : 'Registration successful',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: data.session,
      needs_confirmation: needsConfirmation,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const validated = loginSchema.parse(req.body);

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (error) {
      // Pass through Supabase's actual error for better UX
      const msg = error.message || 'Invalid email or password';
      
      // Map common Supabase errors to user-friendly messages
      let userMessage = msg;
      if (msg.includes('Email not confirmed')) {
        userMessage = 'Please confirm your email address first. Check your inbox for the confirmation link.';
      } else if (msg.includes('Invalid login credentials')) {
        userMessage = 'Invalid email or password. Please check your credentials and try again.';
      }
      
      return res.status(401).json({ error: userMessage });
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        profile,
      },
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .single();

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        profile: req.user.profile,
        subscription: subscription || null,
      },
    });
  } catch (err) {
    next(err);
  }
}
