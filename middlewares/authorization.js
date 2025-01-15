export function authorization (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  req.flash('not_login_warning', '需要先登入您的帳號')
  res.redirect('/users/login')
}

export function checkEmailPassword (req, res, next) {
  if (!req.body.email.trim() || !req.body.password.trim()) {
    req.flash('login_error', '信箱或密碼未填寫')
    return res.redirect('/users/login')
  }
  next()
}
