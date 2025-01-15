// 這個model紀錄各model的最後一個id在哪裡，確保id遞增時依照正確數字增加
import mongoose from 'mongoose'

const CounterSchema = new mongoose.Schema({
  _id: { // 紀錄不同schema的名稱
    type: String,
    required: true
  },
  sequence: { // 每個schema單獨紀錄自己創造的最後_id
    type: Number,
    default: 0
  }
})

export default mongoose.models?.Counter ||
  mongoose.model('Counter', CounterSchema)
