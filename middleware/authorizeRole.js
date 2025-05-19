const authorizeRole = (role) => {
  return (req, res, next) => {
    if (role !== req.user.role) {
      return res.status(403).json({
        message: 'Unauthorized',
      });
    }
    next();
  };
};

export { authorizeRole };
// usecase
// router.delete('/user/:id', authenticateToken, authorizeRole(['admin']), deleteUser);
