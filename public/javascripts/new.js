const cost_name = document.getElementById('name');
const category = document.getElementById('categoryID');
const money = document.getElementById('amount');
const categoryOption = category.querySelector('option[value=""]');

const categories = {
  '6': 'waterAmount',
  '7': 'electricityAmount',
  '8': 'telecomAmount'
};

Object.keys(categories).forEach(cat => {
  if (localStorage.getItem(categories[cat]) === null) {
    localStorage.setItem(categories[cat], '');
  }
});

category.addEventListener('change', function() {
  handleCategoryChange(category.value);
});

function handleCategoryChange(categoryID) {
  const amountKey = categories[categoryID];

  if (amountKey) {
    let storedAmount = localStorage.getItem(amountKey) || '';
    money.value = storedAmount;

    money.removeEventListener('input', updateAmount);
    money.addEventListener('input', updateAmount);

    function updateAmount() {
      localStorage.setItem(amountKey, money.value);
    }
  }
}

const form = document.querySelector('form')
const submitBtn = document.querySelector('#submit-btn')
const hiddenImageInput = document.createElement('input'); // 創建一個隱藏的輸入字段
hiddenImageInput.type = 'hidden';
hiddenImageInput.name = 'image';
form.appendChild(hiddenImageInput); // 將隱藏輸入字段添加到表單
form.addEventListener('submit', (event) => {
  if (!form.checkValidity()) {
    event.preventDefault() // 不要submit
    event.stopPropagation() // event不要bubble
  }
})
submitBtn.addEventListener('click', (event) => {
  form.classList.add('was-validated')
})

// 限制input時最大值只能是今天
const dateInput = document.querySelector('#date')
const today = new Date()
dateInput.max = today.toISOString().split('T')[0]
// input預設是今天
if (!dateInput.value) {
  dateInput.value = today.toISOString().split('T')[0]
}

//收據預覽
const previewImage = document.getElementById('preview-image');
previewImage.style.display = 'none'; // 默認隱藏

// 收據預覽的事件監聽器
const imageInput = document.getElementById('image');
imageInput.addEventListener('change', function() {
  const file = this.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        previewImage.src = event.target.result;
        previewImage.style.display = 'block'; // 顯示
        const postData = {
          'image_src' : previewImage.src
        };
        fetch("http://localhost:8000/upload",{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          const img_url = data;
          hiddenImageInput.value = img_url;
          console.log(data)
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
      };
      reader.readAsDataURL(file);
  } else {
      previewImage.src = "";
      previewImage.style.display = 'none'; // 隱藏
      form.image = ""; // 清空表單中的圖片數據
  }
});

//預覽圖片彈出
previewImage.addEventListener('click', function() {
    // 創建一個新的 img 元素作為放大顯示的圖片
    const enlargedImage = new Image();
    // 設置放大顯示圖片的 src 為預覽圖片的 src
    enlargedImage.src = this.src;
    // 設置放大顯示圖片的樣式，使其居中並設置最大寬度
    enlargedImage.style.maxWidth = '80%';
    enlargedImage.style.display = 'block';
    enlargedImage.style.margin = 'auto';
    // 創建一個新的 div 元素作為放大顯示的視窗
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.appendChild(enlargedImage);
    // 將放大顯示的視窗添加到 body 中
    document.body.appendChild(modal);

    // 創建一個關閉按鈕
    const closeButton = document.createElement('button');
    closeButton.textContent = '關閉';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '100px';
    closeButton.style.right = '130px';
    closeButton.style.padding = '5px';
    closeButton.style.border = 'none';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.color = '#fff';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontWeight = 'bold';
    closeButton.style.zIndex = '999';
    closeButton.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    modal.appendChild(closeButton);

    // 將放大顯示的視窗添加到 body 中
    document.body.appendChild(modal);
});

// 呼叫GPT
function generate(){
  const postData = {
    'image_src' : previewImage.src
  };
  fetch("http://localhost:8000/gpt",{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    updateInterfaceAndStorage(data)
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}



// print gpt response
function updateInterfaceAndStorage(data) {
  var output = document.getElementById('output')
  var receipt_data = JSON.parse(data);
  
  cost_name.value = receipt_data.name;
  money.value = receipt_data.money;
  categoryOption.textContent = receipt_data.category;
  if (receipt_data.category === "家居物業") {
    category.value = "1";
  } else if (receipt_data.category === "交通出行") { 
    category.value = "2";
  } else if (receipt_data.category === "休閒娛樂") { 
    category.value = "3";
  } else if (receipt_data.category === "餐飲食品") { 
    category.value = "4";
  } else { 
    category.value = "5";
  }

  output.innerText = data;
}