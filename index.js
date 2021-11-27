const db = new Dexie('ShoppingApp')
db.version(1).stores({ items: '++id,name,price,isPurchased' })

const itemForm = document.getElementById('itemForm')
const itemsDiv = document.getElementById('itemsDiv')
const totalPriceDiv = document.getElementById('totalPriceDiv')
const updateForm = document.getElementById('updateForm')


const populateItemsDiv = async () => {
  const allItems = await db.items.reverse().toArray()

  itemsDiv.innerHTML = allItems.map(item => `
    <div class="item ${item.isPurchased && 'purchased'}">
      <input
        type="checkbox"
        class="checkbox"
        onchange="toggleItemStatus(event, ${item.id})"
        ${item.isPurchased && 'checked'}
      />
      
      <div class="itemInfo">
        <p>${item.name}</p>
        <p>$${item.price} x ${item.quantity}</p>
      </div>
     
      ${!item.isPurchased ? `<div>
      <button class="editButton" onClick="editItemTrigger(${item.id})"><img src="https://img.icons8.com/color/50/000000/edit--v3.png"/></button>
      <button onclick="removeItem(${item.id})" class="deleteButton">
      <img src="https://img.icons8.com/ios/50/000000/cancel.png"/>
      </button>
      </div>`: `Purchased ✔`}
    </div>
  `).join('')

  const arrayOfPrices = allItems.map(item => item.price * item.quantity)
  const totalPrice = arrayOfPrices.reduce((a, b) => a + b, 0)

  totalPriceDiv.innerText = 'Total price: $' + totalPrice
}

window.onload = populateItemsDiv

itemForm.onsubmit = async (event) => {
  event.preventDefault()

  const name = document.getElementById('nameInput').value
  const quantity = document.getElementById('quantityInput').value
  const price = document.getElementById('priceInput').value


  await db.items.add({ name, quantity, price})
  await populateItemsDiv()

  itemForm.reset()
}


const updateItem = async (event, id) => {
  event.preventDefault()
  const name = document.getElementById('updatednameInput').value
  const quantity = document.getElementById('updatedquantityInput').value
  const price = document.getElementById('updatedpriceInput').value

  await db.items.update(id, { name, quantity, price })
  await populateItemsDiv()
  window.location.reload()
} 

const toggleItemStatus = async (event, id) => {
  await db.items.update(id, { isPurchased: !!event.target.checked })
  await populateItemsDiv()
}

const removeItem = async id => {
  await db.items.delete(id)
  await populateItemsDiv()
}

const populateUpdateForm = async id =>{
  const allItems = await db.items.reverse().toArray()
  const currentItem = allItems.find(i=> i.id===id)
  const con = document.getElementById('itemUpdateDiv')

   const content =`<form  id="updateForm" onsubmit="updateItem(event, ${currentItem.id})">
       <label>
          Name of Item:
          <input type="text" id="updatednameInput" value=${currentItem.name} required>
        </label>

        <label>
          Quantity:
          <input type="number" id="updatedquantityInput" value=${currentItem.quantity}>
        </label>

        <label>
          Price:
          <input type="number" id="updatedpriceInput" value=${currentItem.price}>
        </label>

        <button type="submit" id="editItemButton">Update item</button>
      </form>`

    con.innerHTML = content;
}

const editItemTrigger = async id => {
  document.getElementById('itemForm').style.display = "none";
  await populateUpdateForm(id)
}

const clearAllItems = () => {
  db.items.clear()
  populateItemsDiv()
  window.location.reload()
}
