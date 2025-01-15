import mongoose from 'mongoose'
import { db } from '../../configs/mongoose.js'
import Record from '../record.js'
import User from '../user.js'
import Category from '../category.js'
import bcrypt from 'bcryptjs'

const seedUser = [{
  name: 'root',
  email: 'root@example.com',
  password: '12345678'
}]

db.once('open', async () => {
  console.log('開始建立預設帳號，請耐心等待')
  const categories = await Category.find().lean()
  for (let i = 0; i < seedUser.length; i++) {
    // 看看seed user是否已建立，如果未建立才執行
    let user = await User.findOne({ email: seedUser[i].email })
    if (!user) {
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(seedUser[i].password, salt)
      user = new User({
        name: seedUser[i].name,
        email: seedUser[i].email,
        password: hash
      })
      await user.save()
    }

    const recordPromises = [] // 將建立records的promise物件放於此陣列

    // 每個category建立7天/每天3項消費
    for (const category of categories) {
      for (let date = 0; date < 1; date++) {
        for (let item = 1; item <= 2; item++) {
          const recordName = `${category.name}-test-${date * 3 + item}`
          const recordAmount = date * 1000 + item * 100
          const recordDate = new Date(Date.now() - 86400000 * date).setHours(0, 0, 0, 0) // record建立在midnight
          // 如果record出現過得就不要再建立了
          const record = await Record.findOne({ userID: user._id, categoryID: category._id, name: recordName })
          if (!record) {
            // 建立create record 的promise物件
            const recordPromise = Record.create({
              name: recordName,
              date: recordDate,
              amount: recordAmount,
              categoryID: category._id,
              isFixed: category.isFixed,
              userID: user._id
            })

            recordPromises.push(recordPromise)
          }
        }
      }
    }
    // 等待所有record都建立好才向下執行disconnect
    await Promise.all(recordPromises)
    console.log(`完成建立預設資料,\n請使用以下帳號登入看看:\nemail: ${seedUser[0].email}\npassword: ${seedUser[0].password}`)
  }
  if (mongoose.connection.readyState === 1) { // state 1 connected
    mongoose.disconnect()
  }
})
