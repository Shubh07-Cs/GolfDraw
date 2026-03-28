export function adminGuard(req, res, next) {
  if (!req.user || !req.user.profile) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}
