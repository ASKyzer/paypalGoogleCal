let packagesData
// Modal Elements IDs
const modalContent = document.querySelector('#otdhModalContent')
const modalTitle = document.querySelector('#checkoutModalTitle')
const shoppingCart = document.querySelector('#shopping-cart')
const paypalPayment = document.querySelector('#paypalCheckout')

paypal.Button.render({
  env: 'sandbox', // sandbox | production
  style: {
    layout: 'vertical',
    size:   'medium',
    shape:  'rect',
    color:  'gold'
  },
  funding: {
    allowed: [
      paypal.FUNDING.CARD,
      paypal.FUNDING.CREDIT
    ],
    disallowed: []
  },
  commit: true,
  // PayPal Client IDs - replace with your own
  // Create a PayPal app: https://developer.paypal.com/developer/applications/create
  client: {
    sandbox: 'Afpe0-1Q3W1N-qRcIUF_9YyJ7iQXEq9R0_ukkN3Spc_eXoQ9NofkK1h0NAem9rWYUi-cLtOae3iv-r2W'
    // production: '<insert production client id>'
  },
  payment: function (data, actions) {
    const deposit = document.querySelector('#tour-deposit').innerText
    return actions.payment.create({
      payment: {
        transactions: [
          {
            amount: {
              total: deposit,
              currency: 'USD'
            }
          }
        ]
      }
    })
  },

  onAuthorize: function (data, actions) {
    // Order ID from PayPal payment so we can keep track of this particular purchase.
    const orderNumber = data.orderID
    // Get buyer and tour info
    const buyer = getFormInputInfo('#buyer-form')
    const tour = purchasedTourInfo()
    // Convert numbered month to worded month and from yyyy-mm-dd format to month dd, yyyy format
    const date = convertDate(buyer.date)

    // Since Netlify only sends the serialized input values, I created a hidden tour-details input field and set it's value to the details of the purchaseed tour including the order number so it can be sent along with the buyer contact info to OTDH.
    const description = document.querySelector('#tour-details')
    const tourDetails = `
      Order Number: ${orderNumber}
      Date: ${date}
      Name: ${tour.title}
      ${tour.location}
      Price: ${tour.price}
      Deposit: ${tour.deposit}
    `;

    description.value = tourDetails

    writeThankYouNote(buyer, tour, date, orderNumber)

    return actions.payment.execute()
      .then(function () {
        const $form = $("#buyer-form");
        $.post($form.attr("action"), $form.serialize()).then(function() {
          alert("Thank you!");
          // reset the form so it can be serialized again for next purchase
          document.getElementById('buyer-form').reset()
        });
      })
    }
  }, '#paypal-button-container')

function writeThankYouNote(buyer, tour, date, orderNumber) {
  shoppingCart.style.display = 'none'
  modalTitle.innerText = 'Success! Thank You!'
  paypalPayment.style.display = 'none'

  const thankYouModalMarkup = `
    <div class="p-3">
      <p>Dear ${buyer.firstName} ${buyer.lastName},</p>
      <p>Thank you for choosing to book your adventures with Ocean Tigers Dive House.</p>
      <p>Please check to see if your email is correct. We will send you an email to confirm your booking.<p>

      <p class="m-0"><b >Tour Information:</b></p>
      <p class="m-0"><b>Tour:</b> ${tour.title}</p>
      <p class="m-0"><b>Tour Date:</b> ${date}</p>
      <p class="m-0"><b>Tour Price: $</b> ${tour.price} USD</p>
      <p class="m-0"><b>Deposit: $</b> ${tour.deposit} USD</p>
      <p class="m-0"><b>Order No.:</b> ${orderNumber}</p>
      <br>
      <p class="m-0"><b>Your Information:</b></p>
      <p class="m-0"><b>Name:</b> ${buyer.firstName} ${buyer.lastName}</p>
      <p class="m-0"><b>Email:</b> ${buyer.email}</p>
      <p class="m-0"><b>Phone:</b> +${buyer.phone}</p>
      <br>
      <p>Please review the information above and if anything is incorrect, or if you have any additional questions, please email us at
        <a href="mailto:oceantigersdivehouse@gmail.com?Subject=${tour.title}%20${orderNumber}" target="_top">oceantigers@gmail.com</a>.
      </P>
      <p>We look forward to joining you in this incredible adventure on ${date}.</p>

      <div class="row align-items-center">
        <div class="col-8">
          <p>Sincerely,</p>
          <p>The Ocean Tigers Dive House Staff</p>
        </div>
        <div class="col-4">
          <img src="https://www.datocms-assets.com/9161/1549031775-logo-transparent-fish.png" class="img img-responsive img-fluid" alt="OTDH Logo" />
        </div>
      </div>
    </div>
  `;
  modalContent.innerHTML = thankYouModalMarkup
}

// jQuery serializeArray() to target form and put the name: value fields to return data object
function getFormInputInfo(formID) {
  const myForm = $(formID).serializeArray()
  const formData = {}
    $.each(myForm, function(i, field)
      { formData[field.name] = field.value })
    return formData
}

// Retrieve the tour that the customer puchased
function purchasedTourInfo() {
  const tourTitle = document.querySelector('#tour-title')
  const tourDescription = document.querySelector('#tour-description')
  const tourLocation = document.querySelector('#tour-location')
  const tourPrice = document.querySelector('#tour-price')
  const tourDeposit = document.querySelector('#tour-deposit')

  return {
    price: parseFloat(tourPrice.innerText).toFixed(2),
    deposit: parseFloat(tourDeposit.innerText).toFixed(2),
    description: tourDescription.innerText,
    title: tourTitle.innerText,
    location: tourLocation.innerText
  }
}

function openContactForm(e) {
  const buyerForm = document.querySelector('#buyer-form')
  // clearForm('#buyer-form')
  // Reset All Modal Contents and Displays
  modalTitle.innerText = ''
  modalContent.innerHTML = ''
  buyerForm.style.display = 'block'
  shoppingCart.style.display = 'block'

  if (e.target.id === 'purchase-tour') {
    $('#otdhModal').modal('show');
  }
  modalTitle.innerText = "Please enter your contact information"
  const tour = getChosenTourInfo(e)
  addTourToCheckout(tour)
  displayDeposit(tour)
  preventPastDate()
  // Event Listener to submit form
  buyerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    checkOut(modalContent)
  });
  // Listen for Clear Form click
  const clearBuyerFormBtn = document.querySelector('#clear-buyer-form')
  clearBuyerFormBtn.addEventListener('click', function() {
    clearForm('#buyer-form')
  })
}

function clearForm(formID) {
  const myForm = document.querySelector(formID)
  let inputs = myForm.elements;
  inputs = Array.from(inputs)
  inputs.forEach(i => i.value = '')
}

// with chosen tour, display it on the contact form and checkout form
function addTourToCheckout(tour) {
  const deposit = parseFloat(tour.price * .2).toFixed(2)
  const price = parseFloat(tour.price).toFixed(2)
  if (tour) {
    const markup = `
      <div class="mb-2">
        <p class="h3 text-center">${tour.name}<p>
        <div class="card mb-3 h-100" id="tourCards">
          <img src="${tour.imageUrl}" data-value="${tour.imageUrl}" data-id="imageUrl" class="card-img-top tour" alt="${tour.name}">
          <h5 class="card-header tour pl-4 pr-4 pt-2 pb-2 bg-warning border-dark" data-value="${tour.name}" data-id="title" id="tour-title">${tour.name}</h5>
          <div class="card-body mb-3">
            <p class="card-text tour" data-value="${tour.description}" data-id="description" id="tour-description">${tour.description}</p>
            <p class="card-text tour" data-value="${tour.location}" data-id="location" id="tour-location">Location: ${tour.location}</p>
            <p class="card-text m-0">Price: $ <span class="tour" data-value="${price}" data-id="price" id="tour-price">${price}</span> USD</p>
            <p class="card-text m-0">Deposit: $ <span class="tour" data-value="${deposit}" data-id="deposit" id="tour-deposit">${deposit}</span> USD</p>
          </div>
        </div>
      </div>
      `
      shoppingCart.innerHTML = markup
  }
}

function displayDeposit(tour) {
  const depositCharged = document.querySelector('.cost-charged')
  const deposit = parseFloat(tour.price * .2).toFixed(2)

  const markupDepositCharged = `
      <p>You will be charged a deposit of:</P
      <p class="font-weight-bold text-h4">$${deposit} USD</p>
    `
      depositCharged.innerHTML = markupDepositCharged
}

function getChosenTourInfo(e) {
  e.preventDefault()
  const { target: { dataset: { id } }} = e
  return packagesData[id]
}

// Retrieve Customer info form the contact cards and display in the checkout form
function addCustomerToCheckout(modalContent) {
  // const customer = document.querySelector('.customer-info')
  const buyer = getFormInputInfo("#buyer-form")
  const date = convertDate(buyer.date)

  const markupTourCard = `
    <div class="pl-3 pr-3">
      <h5 class="m-0 mt-3 mb-3 text-underline">Contact Information:</h5>
      <p class="m-0"><span class="customer-first-name">${buyer.firstName}</span>&nbsp;<span class="customer-last-name">${buyer.lastName}</span></p>
      <p class="m-0 mt-1"><span class="customer-email">${buyer.email}</span></p>
      <p class="m-0 mb-3"><span class="customer-phone">+${buyer.phone}</span></p><br>
      <h5 class="m-0 p-0">Tour Date: &nbsp;<span class="tour-date">${date}</span></h5>
    </div>
  `;
    modalContent.innerHTML = markupTourCard
}

// Hide contact modal and show the checkout modal with paypal buttons
function checkOut(modalContent){
  const buyerForm = document.querySelector('#buyer-form')
  buyerForm.style.display= 'none'
  modalTitle.innerText = 'Checkout'
  paypalPayment.style.display = 'block'
  addCustomerToCheckout(modalContent)
}

function preventPastDate() {
  // Prevent customer from choosing past dates
  const dt = new Date()
  const yyyy = dt.getFullYear().toString()
  const mm = (dt.getMonth() + 1).toString() // getMonth() is zero-based
  const dd  = dt.getDate().toString()
  const min = yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]) // padding
  $('#tour-date').prop('min', min)
}

// Add tour cards to the DOM based on the data from datoCMS
function populateCards(packages, cardsContainer) {
  packages.forEach((value, index) => {
    const markup = `
      <div class="col-lg-4 col-md-6 mt-3">
        <div class="card mb-3 h-100" id="tourCards">
          <img src="${value.imageUrl}" data-value="${value.imageUrl}" data-id="imageUrl" class="card-img-top tour" alt="${value.name}">
          <h5 class="card-header tour pl-4 pr-4 pt-2 pb-2 bg-warning border-dark" data-value="${value.name}" data-id="title" id="card-tour-title">${value.name}</h5>
          <div class="card-body">
            <p class="card-text tour" data-value="${value.description}" data-id="description" id="card-tour-description">${value.description}</p>
            <p class="card-text tour" data-value="${value.location}" data-id="location" id="card-tour-location">Location: ${value.location}</p>
            <p class="card-text m-0">Price: $<span class="tour tour-price" data-value="${Number(value.price)}" data-id="price" id="card-tour-price">${Number(value.price).toFixed(2)}</span> USD</p>
            <p class="card-text m-0">Deposit: $<span class="tour tour-deposit" data-value="${Number(value.price) * .2}" data-id="deposit" id="card-tour-deposit">${(Number(value.price) * .2).toFixed(2)}</span> USD</p>
          </div>
          <div class="p-4">
              <a href="#" class="btn btn-warning border-dark"
              data-id="${index}"
              data-toggle="modal"
              data-target="#contactModal"
              id="purchase-tour">Buy Now</a>
          </div>
        </div>
      </div>
      `
      cardsContainer.innerHTML += markup
  })
}

function getPackages(token, cardsContainer) {
  fetch( 'https://graphql.datocms.com/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          {
            allPackages() {
              name
              location
              price
              description
              imageUrl
            }
          }
        `
      }),
    }
  )
  .then(res => res.json())
  .then((res) => {
    const {data: { allPackages }} = res
    packagesData = allPackages
    populateCards(packagesData, cardsContainer)
  })
  .catch((error) => { console.log(error) })
}

// Converting numbered month to named month and returning format from yyyy-mm-dd to month dd, yyyy
function convertDate(date) {
  const months = {
    '01' : 'January',
    '02' : 'February',
    '03' : 'March',
    '04' : 'April',
    '05' : 'May',
    '06' : 'June',
    '07' : 'July',
    '08' : 'August',
    '09' : 'September',
    '10' : 'October',
    '11' : 'November',
    '12' : 'December'
}
  const dateArr = date.split('-')
  const year = dateArr[0]
  const day = dateArr[2]
  const month = months[dateArr[1]]

  return `${month} ${day}, ${year}`
}

function init() {
  const token = '60ce28d9190500bbe827ebb7766ffa'
  const cardsContainer = document.querySelector('#tour-cards')
  getPackages(token, cardsContainer)
  cardsContainer.addEventListener('click', openContactForm)
  $('#otdhModal').modal('hide');
  paypalPayment.style.display = 'none';
}
init()



