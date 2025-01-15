import passport from 'passport'
import LocalStrategy from 'passport-local'
import GitHubStrategy from 'passport-github2'
import GoogleStrategy from 'passport-google-oauth20'
import User from '../models/user.js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { nanoid } from 'nanoid'
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env' })
}
const localStrategy = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // 要打開這個才能回傳flash
  },
  async function verify (req, email, password, done) {
    try {
      const user = await User.findOne({ email })
      if (!user) {
        const message = '您提供的信箱尚未註冊'
        req.flash('login_error', message)
        return done(null, false, { message })
      }

      const psIsCorrect = await bcrypt.compare(password, user.password)
      if (!psIsCorrect) {
        const message = '您提供的密碼與信箱不符'
        req.flash('login_error', message)
        return done(null, false, { message })
      }
      return done(null, user)
    } catch (error) {
      req.flash('login_error', error.message)
      return done(error, false)
    }
  }
)
const googleStrategy = new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK
},
async function (accessToken, refreshToken, profile, done) {
  try {
    const name = profile._json.name
    const email = profile._json.email

    const user = await User.findOne({ email })
    if (user) {
      return done(null, user)
    } else {
      const password = nanoid()
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(password, salt)
      const newUser = new User({
        name,
        email,
        password: hash
      })
      await newUser.save()
      return done(null, newUser)
    }
  } catch (error) {
    return done(error, false)
  }
}
)
const gitHubStrategy = new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK,
  scope: 'user:email' // github在router的scope回傳email時有的時候會是null,直接在passport設定
},
async function (accessToken, refreshToken, profile, done) {
  try {
    const name = profile.displayName
    const email = profile.emails[0].value

    const user = await User.findOne({ email })
    if (user) {
      return done(null, user)
    } else {
      const password = nanoid()
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(password, salt)
      const newUser = new User({
        name,
        email,
        password: hash
      })
      await newUser.save()
      return done(null, newUser)
    }
  } catch (error) {
    return done(error, false)
  }
}
)
export function usePassport (app) {
  app.use(passport.initialize())
  app.use(passport.session())
  passport.use(localStrategy)
  passport.use(gitHubStrategy)
  passport.use(googleStrategy)
  passport.serializeUser(function (user, done) {
    return done(null, user.id)
  })

  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id).lean()
      return done(null, user)
    } catch (error) {
      return done(error, false)
    }
  })
}
