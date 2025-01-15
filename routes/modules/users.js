import bcrypt from 'bcryptjs'
import express from 'express'
import passport from 'passport'
import User from '../../models/user.js'
import { checkEmailPassword } from '../../middlewares/authorization.js'
export const router = express.Router()

router.get('/login', (req, res) => {
  if (!req.isAuthenticated()) {
    res.render('login', { title: '登入帳本', stylesheet: 'login.css' })
  } else {
    res.redirect('/entries')
  }
})

router.post('/login',
  checkEmailPassword, // passport有bug，它沒辦法檢查空的email和password，要自己另外寫middleware
  passport.authenticate('local',
    {
      failureRedirect: '/users/login',
      failureMessage: true
    }),
  (req, res) => {
    res.redirect('/entries')
  })

router.get('/register', (req, res) => {
  res.render('register', { title: '註冊帳本', stylesheet: 'login.css' })
})

router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  const registerErrors = []
  if (!(name && email && password && confirmPassword)) {
    registerErrors.push('所有項目皆為必填')
  }
  if (password !== confirmPassword) {
    registerErrors.push('密碼與確認密碼不相符')
  }
  const user = await User.findOne({ email })
  if (user) {
    registerErrors.push('此email已被註冊')
  }
  if (registerErrors.length) {
    req.flash('register_errors', registerErrors)
    return res.redirect('/users/register')
  }
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  const newUser = new User({ name, email, password: hash })
  await newUser.save()
  req.flash('register_success', '已成功註冊帳號')
  res.redirect('/users/login')
})

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err) }
    req.flash('logout_success', '已成功登出')
    res.redirect('/users/login')
  })
})
