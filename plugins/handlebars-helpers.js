// https://stackoverflow.com/questions/32707322/how-to-make-a-handlebars-helper-global-in-expressjs
export const helpers = {
  // put all of your helpers inside this object
  checkIsLogin: function (title) {
    return title === '登入帳本'
  },
  checkIsRegister: function (title) {
    return title === '註冊帳本'
  },
  matchIcon: function (record, categories) {
    // 在index呈現record時回傳對應categories的icon
    const category = categories.find((item) => {
      return item._id === record.categoryID
    })
    if (category) {
      return category.icon
    } else {
      return null
    }
  },
  matchCategoryName: function (categoryID, categories) {
    // 讓主畫面總消費的字樣可以改成不同category的字樣
    categoryID = parseInt(categoryID, 10)
    const category = categories.find((item) => {
      return item._id === categoryID
    })
    if (category) {
      return category.name
    } else {
      return null
    }
  },
  selectedInEdit: function (categoryID, recordID) {
    return categoryID === recordID
  }
}
