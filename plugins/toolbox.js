import Category from '../models/category.js'

export async function getCategory () {
  const categories = await Category.find().sort({ _id: 1 }).lean()
  return categories
}
