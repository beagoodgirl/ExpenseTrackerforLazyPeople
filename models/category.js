import mongoose from 'mongoose'
import Counter from './counter.js'
const CategorySchema = new mongoose.Schema({
  _id: {
    type: Number
  },
  name: {
    type: String,
    required: [true, '建立新的支出類別需要提供 name']
  },
  icon: {
    type: String,
    required: [true, '支出類別需要有一個font awesome圖示']
  },
  isFixed: {
    type: Boolean
  },
  AlertDate: {
    type: Number
  }
})
CategorySchema.pre('save', async function (next) {
  try {
    const doc = this // 代表現在新增的document
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'categoryId' }, // 找到Couter中紀錄的model_id
      { $inc: { sequence: 1 } }, // sequence + 1
      { new: true, upsert: true }
      // new: true => findByIdAndUpdate會回傳未更新的document, true可以回傳更新過的
      // upsert: true 如果沒有就建立一個新的counter document
    ).exec()

    doc._id = doc._id || counter.sequence // 如果有手動給id||新建的category _id = sequence
    next() // 儲存
  } catch (error) {
    next(error)
  }
})

export default mongoose.models?.Category ||
  mongoose.model('Category', CategorySchema)
