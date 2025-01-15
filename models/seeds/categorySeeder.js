import Category from '../category.js'
import categoryJSON from './category.json' assert { type: "json" }
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { db } from '../../configs/mongoose.js'

db.once('open', async function () {
  await createDefaultCategory()

  if (mongoose.connection.readyState === 1) { // state 1 connected
    await mongoose.disconnect()
  }
})

// 從category.json中創造預設五個固定id的支出分類
async function createDefaultCategory () {
  try {
    for (const item of categoryJSON) {
      const category = await Category.findOne({ name: item.name })
      if (!category) {
        const defaultCategory = new Category({
          _id:item._id,
          name:item.name,
          icon:item.icon,
          isFixed:item.isFixed
        })
        await defaultCategory.save()
        console.log('建立Default category: ', item.name)
      } else {
        console.log(`category "${item.name}" 已存在, 不執行建立Default category`)
      }
    }
  } catch (error) {
    console.error('建立default category遇到以下問題： ', error.message)
  }
}