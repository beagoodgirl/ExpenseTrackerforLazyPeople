import mongoose from 'mongoose'
import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env' })
}
mongoose.connect(process.env.MONGODB_URL)
export const db = mongoose.connection

db.on('error', (error) => {
  console.error('MongoDB fatal fail: ', error.message)
})
db.once('open', async () => {
  console.log('Mongodb connected successfully')
})
