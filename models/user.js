import mongoose from 'mongoose'
import Counter from './counter.js'
const UserSchema = new mongoose.Schema({
  _id: {
    type: Number
    // required: [true, '建立新的使用者需要提供 _id']
  },
  name: {
    type: String,
    required: [true, '建立新的使用者需要提供 name']
  },
  email: {
    type: String,
    required: [true, '建立新的使用者需要提供 email']
  },
  password: {
    type: String,
    required: [true, '建立新的使用者需要提供 password']
  }
})
UserSchema.pre('save', async function (next) {
  try {
    const doc = this // 代表現在新增的document
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'userId' }, // 找到Couter中紀錄的model_id
      { $inc: { sequence: 1 } }, // sequence + 1
      { new: true, upsert: true }
      // new: true => findByIdAndUpdate會回傳未更新的document, true可以回傳更新過的
      // upsert: true 如果沒有就建立一個新的counter document
    ).exec()

    doc._id = counter.sequence // 新建的category _id = sequence
    next() // 儲存
  } catch (error) {
    next(error)
  }
})

export default mongoose.models?.User ||
  mongoose.model('User', UserSchema)
