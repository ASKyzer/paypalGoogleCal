// Render the PayPal button
paypal.Button.render({
  // Set your environment
  env: 'sandbox', // sandbox | production
  
  // Specify the style of the button
  style: {
    layout: 'vertical',  // horizontal | vertical
    size:   'medium',    // medium | large | responsive
    shape:  'rect',      // pill | rect
    color:  'gold'       // gold | blue | silver | white | black
  },
  
  // Specify allowed and disallowed funding sources
  //
  // Options:
  // - paypal.FUNDING.CARD
  // - paypal.FUNDING.CREDIT
  // - paypal.FUNDING.ELV
  funding: {
    allowed: [
      paypal.FUNDING.CARD,
      paypal.FUNDING.CREDIT
    ],
    disallowed: []
  },
  
  // Enable Pay Now checkout flow (optional)
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
    const buyer = getFormInputInfo("#buyer-form")            
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
        });
          // Hide modals
          hideCheckoutModal()
          hideContactModal()
          // Show thank you modal
          showThankYouModal()
      })
    }
  }, '#paypal-button-container')

function writeThankYouNote(buyer, tour, date, orderNumber) {
  const thankYou = document.querySelector('#thank-you')
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
  thankYou.innerHTML = thankYouModalMarkup
}

// jQuery serializeArray() to target form and put the name: value fields to return data object
function getFormInputInfo(formID) {
  const myForm = $(formID).serializeArray()
  const formData = {}
    $.each(myForm, function(i, field)
      { formData[field.name] = field.value })
    return formData
}

// Retrieve the tour that the customer puchAsed
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
  // Get chosen tour and pass it along to addTourToCheckout()
  const tour = getChosenTourInfo(e)
  addTourToCheckout(tour)
  preventPastDate()
  // Event Listener to submit form
  const buyerForm = document.querySelector('#buyer-form')
  buyerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    checkOut()
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

// Modal Actions
function toggleContactModal() { $('#contactModal').modal('toggle') }
function hideContactModal() { $('#contactModal').modal('hide') }
function showContactModal() { $('#contactModal').modal('show') }
function toggleCheckoutModal() { $('#checkoutModal').modal('toggle') }
function hideCheckoutModal() { $('#checkoutModal').modal('hide') }
function showCheckoutModal() { $('#checkoutModal').modal('show') }
function showThankYouModal() { $('#thankYouModal').modal('show') }

// with chosen tour, display it on the contact form and checkout form
function addTourToCheckout(tour) {
  const shoppingCart = document.querySelectorAll('.shopping-cart')
  const depositCharged = document.querySelector('.cost-charged')
  if (tour) {
    const markup = `
      <div class="mb-2">
        <p class="h3 text-center">${tour.title}<p>
        <div class="card mb-3 h-100" id="tourCards">
          <img src="${tour.imageUrl}" data-value="${tour.imageUrl}" data-id="imageUrl" class="card-img-top tour" alt="${tour.title}">
          <h5 class="card-header tour pl-4 pr-4 pt-2 pb-2 bg-warning border-dark" data-value="${tour.title}" data-id="title" id="tour-title">${tour.title}</h5>
          <div class="card-body mb-3">
            <p class="card-text tour" data-value="${tour.description}" data-id="description" id="tour-description">${tour.description}</p>
            <p class="card-text tour" data-value="${tour.location}" data-id="location" id="tour-location">Location: ${tour.location}</p>
            <p class="card-text m-0">Price: $ <span class="tour" data-value="${parseFloat(tour.price).toFixed(2)}" data-id="price" id="tour-price">${parseFloat(tour.price).toFixed(2)}</span> USD</p>
            <p class="card-text m-0">Deposit: $ <span class="tour" data-value="${parseFloat(tour.deposit).toFixed(2)}" data-id="deposit" id="tour-deposit">${parseFloat(tour.deposit).toFixed(2)}</span> USD</p>
          </div>
        </div>
      </div>
      `; 
      shoppingCart.forEach(el => el.innerHTML = markup)

    const markupDepositCharged = `
      <p>You will be charged a deposit of:</P
      <p class="font-weight-bold text-h4">$${parseFloat(tour.deposit).toFixed(2)} USD</p>
    `;
      depositCharged.innerHTML = markupDepositCharged      
  }
}

function getChosenTourInfo(e) {
  // Michael, can you show me what you would do here with using destructuring?  I read you code review notes and am still confused about what to do.
  const chosenTour = {}

  if(e.target.id === 'purchase-tour') {
    const data = (e.target).closest('#tourCards').querySelectorAll('.tour')
    data.forEach(el => chosenTour[el.dataset.id] = el.dataset.value)
    return chosenTour
  }
  e.preventDefault()
}

// Retrieve Customer info form the contact cards and display in the checkout form
function addCustomerToCheckout() {
  const customer = document.querySelector('.customer-info')
  const buyer = getFormInputInfo("#buyer-form")
  const date = convertDate(buyer.date)
  
  const markupTourCard = `
    <h4 class="m-0 mt-3 mb-3 text-underline">Contact Information:</h4>
    <p class="m-0"><span class="customer-first-name">${buyer.firstName}</span>&nbsp;<span class="customer-last-name">${buyer.lastName}</span></p>
    <p class="m-0 mt-1"><span class="customer-email">${buyer.email}</span></p>
    <p class="m-0 mb-3"><span class="customer-phone">+${buyer.phone}</span></p><br>
    <h5>Tour Date: &nbsp;<span class="tour-date">${date}</span></h5>
  `;
  customer.innerHTML = markupTourCard
}

// Hide contact modal and show the checkout modal with paypal buttons
function checkOut(){
  addCustomerToCheckout()
  toggleCheckoutModal()
  toggleContactModal()
  // Go back button closes the checkout modal and returns to the contact form
  const goBackBtn = document.querySelector('#goBackBtn')
  goBackBtn.addEventListener('click', toggleContactModal)
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
function populateCards(packages) {
  const cardsDiv = document.querySelector('#tour-cards')
  packages.forEach(p => {
    const markup = `
      <div class="col-lg-4 col-md-6 mt-3">
        <div class="card mb-3 h-100" id="tourCards">
          <img src="${p.imageUrl}" data-value="${p.imageUrl}" data-id="imageUrl" class="card-img-top tour" alt="${p.name}">
          <h5 class="card-header tour pl-4 pr-4 pt-2 pb-2 bg-warning border-dark" data-value="${p.name}" data-id="title" id="card-tour-title">${p.name}</h5>
          <div class="card-body">
            <p class="card-text tour" data-value="${p.description}" data-id="description" id="card-tour-description">${p.description}</p>
            <p class="card-text tour" data-value="${p.location}" data-id="location" id="card-tour-location">Location: ${p.location}</p>
            <p class="card-text m-0">Price: $<span class="tour tour-price" data-value="${parseFloat(p.price)}" data-id="price" id="card-tour-price">${parseFloat(p.price).toFixed(2)}</span> USD</p>
            <p class="card-text m-0">Deposit: $<span class="tour tour-deposit" data-value="${parseFloat(p.price) / 5}" data-id="deposit" id="card-tour-deposit">${(parseFloat(p.price) / 5).toFixed(2)}</span> USD</p>
          </div>
          <div class="p-4">
              <a href="#" class="btn btn-warning border-dark" data-toggle="modal" data-target="#contactModal" id="purchase-tour">Buy Now</a>
          </div>
        </div>
      </div>
      `
      cardsDiv.innerHTML += markup
  })
}

// HTTP fecth call to database and retrieving all packages using graphQL
function getPackages(token) {
  // Fetch packages from DatoCMS
  fetch(
    'https://graphql.datocms.com/',
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
    const packages = res.data.allPackages
    populateCards(packages)
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
  const token = '60ce28d9190500bbe827ebb7766ffa';
  // const token = 'DATO_CMS_TOKEN';
  getPackages(token) 
  // Listen for Buy Now click event.
  const cardsDiv = document.querySelector('#tour-cards')
  cardsDiv.addEventListener('click', openContactForm) 
} 
init()


  
