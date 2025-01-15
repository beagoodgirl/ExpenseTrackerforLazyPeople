import express from 'express'
import exphbs from 'express-handlebars'
import methodOverride from 'method-override'
import session from 'express-session'
import flash from 'connect-flash'
import dotenv from 'dotenv'
import cron from 'node-cron'
import nodemailer from 'nodemailer'
import { router as routes } from './routes/index.js'
import { helpers } from './plugins/handlebars-helpers.js'
import { usePassport } from './configs/passport.js'
import './configs/mongoose.js'
import Handlebars from 'handlebars';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env' })
}
const PORT = process.env.PORT

const app = express()
app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  helpers
}))
app.set('view engine', 'handlebars')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(session({
  secret: process.env.SECRET_SESSION_WORD,
  resave: false,
  saveUninitialized: true
}))
app.use(flash())
usePassport(app)
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.not_login_warning = req.flash('not_login_warning')
  res.locals.login_error = req.flash('login_error')
  res.locals.register_errors = req.flash('register_errors')
  res.locals.logout_success = req.flash('logout_success')
  res.locals.register_success = req.flash('register_success')
  next()
})

// app.get('/', (req, res) => {
//   // 準備 days 數據，例如：1 到 31 的數組
//   const days = Array.from({ length: 31 }, (_, i) => i + 1);

//   // 將 days 數據作為一部分數據傳遞給 index.handlebars 模板
//   res.render('index', { days });
// });


let transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
      user: 'ai20844201@yahoo.com.tw', // 你的 Yahoo 電子郵件地址
      pass: 'scmdmxibtktxxnpp' // 你的應用專用密碼
  }
});

// 設置每日電子郵件數據
let dailyMailOptions = {
  from: 'ai20844201@yahoo.com.tw', // 發件人地址
  to: 'liyingchen0304@gmail.com', // 收件人地址
  subject: 'Hello', // 主題
  text: '今天記帳了嗎', // 文本內容
  // html: '<b>Hello world?</b>' // HTML 內容
};

// 安排每天發送電子郵件
cron.schedule('35 23 * * *', () => {
  transporter.sendMail(dailyMailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('每日提醒郵件已發送: ' + info.response);
    }
  });
});

// 每月15日發送的電子郵件選項
let monthlyMailOptions = {
  from: 'ai20844201@yahoo.com.tw',
  to: 'liyingchen0304@gmail.com',
  subject: '每月提醒',
  text: '又到了每月的記帳時間了！'
};

// 安排每月15日發送電子郵件
cron.schedule('35 23 16 * *', () => {
  transporter.sendMail(monthlyMailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('每月提醒郵件已發送: ' + info.response);
    }
  });
});


app.use(routes)
app.listen(PORT, () => {
  console.log(`Port: ${PORT} started`)
})
