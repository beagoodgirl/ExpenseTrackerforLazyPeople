import express from 'express'
import Record from '../../models/record.js'
import { getCategory } from '../../plugins/toolbox.js'
export const router = express.Router()

// 所有的categories去出
const categories = await getCategory()
// 修改支出的頁面
router.get('/:recordID/edit', async (req, res) => {
  // 在put的時候出現錯誤從此取出
  const editErrors = req.flash('edit_errors')[0]
  const user = req.user

  // 取出record
  const recordID = parseInt(req.params.recordID, 10)
  const record = await Record.findOne({ _id: recordID, userID: user._id }).lean()
  record.date = record.date.toISOString().split('T')[0]
  // 和new頁面共用css與js
  res.render('edit', { stylesheet: 'new.css', script: 'new.js', categories, editErrors, user, record })
})
// 修改支出
router.put('/:recordID', async (req, res) => {
  const recordID = parseInt(req.params.recordID, 10)
  try {
    const user = req.user
    const update = req.body
    await Record.findOneAndUpdate({ _id: recordID, userID: user._id }, update, {
      runValidators: true
    })
    res.redirect('/entries')
  } catch (error) {
    console.error(error)
    // 如果出現任何錯誤就放入flash後導回/new_頁面
    req.flash('edit_errors', error.errors)
    res.redirect(`/entries/${recordID}/edit`)
  }
})
// 新增支出的頁面
router.get('/new', (req, res) => {
  // 在post的時候出現錯誤從此取出
  const newErrors = req.flash('new_errors')[0]
  const user = req.user
  res.render('new', { stylesheet: 'new.css', script: 'new.js', categories, newErrors, user })
})
// 新增固定支出的頁面
router.get('/new_fixed', (req, res) => {
  // 在post的時候出現錯誤從此取出
  const newErrors = req.flash('new_errors')[0]
  const user = req.user
  res.render('new_fixed', { stylesheet: 'new.css', script: 'new.js', categories, newErrors, user })
})

// 創建新的支出
router.post('/', async (req, res) => {
  try {
    const user = req.user
    let { name, date, categoryID, amount, image } = req.body
    date = new Date(date)
    amount = parseInt(amount, 10)
    const entry = new Record({
      name,
      date,
      amount,
      userID: user._id,
      categoryID,
      isFixed:false,
      image: image
    })
    await entry.save()
    res.redirect('/entries')
  } catch (error) {
    console.error(error)
    // 如果出現任何錯誤就放入flash後導回/new_頁面
    req.flash('new_errors', error.errors)
    res.redirect('/entries/new')
  }
})

// 創建新的固定支出
router.post('/', async (req, res) => {
  try {
    const user = req.user
    let { name, date, categoryID, amount } = req.body
    date = new Date(date)
    amount = parseInt(amount, 10)
    const entry = new Record({
      name,
      date,
      amount,
      userID: user._id,
      categoryID,
      isFixed:true
    })
    await entry.save()
    res.redirect('/entries')
  } catch (error) {
    console.error(error)
    // 如果出現任何錯誤就放入flash後導回/new_頁面
    req.flash('new_errors', error.errors)
    res.redirect('/entries/new_fixed')
  }
})

// 主要頁面 categoryID非必要，若無則全部顯示
router.get('/:categoryID?', async (req, res) => {
  try {
    // 如果主畫面 與 delete出現error都會放入indexError並從此取出
    const user = req.user
    const indexErrors = req.flash('index_page_error')
    const categoryID = req.params.categoryID
    const query = { userID: user._id }

    if (categoryID) {
      // 如果沒有提供categoryID就不用該條件搜尋，以呈現所有records
      query.categoryID = categoryID
    }

    const entries = await Record.find(query).sort({ date: -1, _id: 1 }).lean()

    // 計算總支出，同時幫每筆entry標上日期
    let totalSpend = 0
    for (const entry of entries) {
      entry.date = entry.date.toLocaleDateString('zh-TW')
      totalSpend += entry.amount
    }
    res.render('index', { stylesheet: 'index.css', script: 'index.js', entries, totalSpend, categories, categoryID, indexErrors, user })
  } catch (error) {
    console.error(error)
    req.flash('index_page_error', error.errors)
    // res.redirect('/entries')
  }
})



// 刪除頁面
router.delete('/:id', async (req, res) => {
  try {
    const user = req.user
    const _id = parseInt(req.params.id, 10)
    await Record.deleteOne({ _id, userID: user._id })
    res.redirect('/entries')
  } catch (error) {
    console.error(error)
    req.flash('index_page_error', error.message)
    res.redirect('/entries')
  }
})
