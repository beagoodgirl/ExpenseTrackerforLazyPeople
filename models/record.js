import mongoose from 'mongoose'
import Counter from './counter.js'
const RecordSchema = new mongoose.Schema({
  _id: {
    type: Number
  },
  name: {
    type: String,
    required: [true, '未輸入正確的支出名稱']
  },
  date: {
    type: Date,
    required: [true, '未輸入正確的支出日期'],
    validate: {
      validator: function (v) {
        return (
          v && // 檢查date是不是存在
              v.getTime() <= Date.now() + 24 * 60 * 60 * 1000
        )
      },
      message: '支出日期最多只能到今天'
    }
  },
  amount: {
    type: Number,
    required: [true, '未輸入正確的支出金額']
  },
  categoryID: {
    type: Number,
    ref: 'Category',
    index: true,
    required: [true, '未選擇正確的支出類別']
  },
  userID: {
    type: Number,
    ref: 'User',
    index: true,
    required: [true, '創立支出doc時未使用正確的userID']
  },
  isFixed: {
    type: Boolean,
  },
  image: {
    type: String,  // 使用字符串類型來存儲圖片的Base64編碼
    required: false
  }
}, { timestamps: true })
RecordSchema.pre('save', async function (next) {
  try {
    const doc = this // 代表現在新增的document
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'recordId' }, // 找到Couter中紀錄的model_id
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

export default mongoose.models?.Record ||
  mongoose.model('Record', RecordSchema)
