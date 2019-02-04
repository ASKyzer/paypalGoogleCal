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
    return actions.payment.execute()
      .then(function () {
         // const clientId = 'CLIENT_ID';
        // const apiKey = 'API_KEY';
        // const scopes = 'https://www.googleapis.com/auth/calendar';
        
        // Authorize owner's Google Calendar
        handleAuth();    
  
        function handleClientLoad() {
          gapi.client.setApiKey(apiKey);
          window.setTimeout(checkAuth,1);
          checkAuth();
        }
  
        function checkAuth() {
          gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true},
              handleAuthResult);
        }
  
        function handleAuthResult(authResult) {
          if (authResult) {
            createCalendarEvent(data);
          } else {
            alert('Event not generated')
          }
        }
  
        function handleAuth(event) {
          gapi.auth.authorize(
              {client_id: clientId, scope: scopes, immediate: true},
              handleAuthResult);
          return false;
        }
        
        function createCalendarEvent(data) {
          gapi.client.load('calendar', 'v3', function() {
            const buyer = getFormInputInfo()            
            const tour = purchasedTourInfo()
            const convertedDate = convertDate(buyer.date)
            const orderNumber = data.orderID
            let state = buyer.state
              if (state === "N/A") { state = "" }
                  
            writeThankYouNote(buyer, tour, convertedDate, orderNumber, state)
  
// Email markup for letter to send with Google calendar invite to buyer
const emailMarkup = `
Dear ${buyer.firstName} ${buyer.lastName},

Thank you for choosing to book your adventures with Ocean Tigers Dive House.

<b style="font-size: 44px;">Tour Information:</b> 
<b>Tour:</b> ${tour.title}
<b>Summary:</b> ${tour.description}
<b>Tour Date:</b> ${convertedDate}
<b>Tour Price: $</b> ${tour.price} USD
<b>Tour Deposit: $</b> ${tour.deposit} USD

<b>Order No.:</b> ${orderNumber}

<b>Your Information:</b>
<b>Name:</b> ${buyer.firstName} ${buyer.lastName}
<b>Address:</b> ${buyer.street} 
            ${buyer.city}, ${state} ${buyer.zip} 
            ${buyer.country}
<b>Email:</b> ${buyer.email}
<b>Phone:</b> +${buyer.phone}

Please review the information above and if anything is incorrect, or if you have any additional questions, please email us at oceantigersdivehouse@gmail.com.  

We look forward to joining you in this incredible adventure.

Sincerely,

The Ocean Tigers Dive House Staff
<img src="https://www.datocms-assets.com/9161/1549031775-logo-transparent-fish.png" class="text-center img img-responsive img-fluid logo" alt="OTDH Logo" />


`;
            
            const event = {
              // 'id': eventID, // Will be automaticall generated
              'summary': `${tour.title}, ${orderNumber}`,
              'location': tour.location,
              'description': emailMarkup,
              'start': {
                'date': buyer.date,
                'timeZone': 'America/Los_Angeles'
              },
              'end': {
                'date': buyer.date,
                'timeZone': 'America/Los_Angeles'
              },
              'attendees': [
                {'email': buyer.email}
              ]
            };
            
            const request = gapi.client.calendar.events.insert({
              'calendarId': 'primary',
              'sendNotifications': true,
              'sendUpdates': 'all',
              'resource': event
            })
            
            request.execute(function(event) {
              console.log(event)
            })
          })

          function writeThankYouNote(buyer, tour, date, orderNumber, state) {
            const thankYou = document.querySelector('#thank-you')
            const thankYouModalMarkup = `
              <div class="p-3">
                <p>Dear ${buyer.firstName} ${buyer.lastName},</p>
                <p>Thank you for choosing to book your adventures with Ocean Tigers Dive House.</p>
          
                <p class="m-0"><b >Tour Information:</b></p>
                <p class="m-0"><b>Tour:</b> ${tour.title}</p>
                <p class="m-0"><b>Summary:</b> ${tour.description}</p>
                <p class="m-0"><b>Tour Date:</b> ${date}</p>
                <p class="m-0"><b>Tour Price: $</b> ${tour.price} USD</p>
                <p class="m-0"><b>Deopsit: $</b> ${tour.deposit} USD</p>
                <p class="m-0"><b>Order No.:</b> ${orderNumber}</p>
                <br>
                <p class="m-0"><b>Your Information:</b></p>
                <p class="m-0"><b>Name:</b> ${buyer.firstName} ${buyer.lastName}</p>
                
                <div class="row d-flex">
                  <div class="col-sm-2 col-xs-12"><b>Address:</b></div>
                  <div class="col-sm-10 col-sx-12 mr-auto">
                      <p class="m-0">${buyer.street}</p>
                      <p class="m-0">${buyer.city}, ${state} ${buyer.zip}</p>
                      <p class="m-0">${buyer.country}</p>
                  </div>
                </div>            
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
        }
        // Hide modals
        $('#checkoutModal').modal('hide')
        $('#contactModal').modal('hide') 
        // Show thank you modal
        $('#thankYouModal').modal('show')
      })
    }
  }, '#paypal-button-container')
  
// Query Selectors and getElements
const cardsDiv = document.getElementById('tour-cards')
const checkoutForm = document.querySelectorAll('.checkout')
const contactSubmit = document.getElementById('submit-contact-info')

// jQuery serializeArray() to target form and put the name: value fields to return data object
function getFormInputInfo() {
  const myForm = $("form").serializeArray()
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

// Listen for Buy Now click event
cardsDiv.addEventListener('click', openContactForm) 

function openContactForm(e) {
  validateEmail()
  validateFields()
  // Get chosen tour and pass it along to addTourToCheckout()
  const tour = getChosenTourInfo(e)
  addTourToCheckout(tour)
}
// with chosen tour, display it on the contact form and checkout form
function addTourToCheckout(tour) {
  const shoppingCart = document.querySelectorAll('.shopping-cart')
  const costCharged = document.querySelector('.cost-charged')
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

    const markupCostCharged = `
      <p>You will be charged a deposit of:</P
      <p class="font-weight-bold text-h4">$${parseFloat(tour.deposit).toFixed(2)} USD</p>
    `;
      costCharged.innerHTML = markupCostCharged      
  }
}

function getChosenTourInfo(e) {
  // Target card and see if there's a buy now button and then target the classes for their values???
  if(e.target.classList.contains('purchase-tour')) {
    const data = (event.target).closest('#tourCards').querySelectorAll('.tour')
    let chosenTour = {}
    data.forEach(el => chosenTour[el.dataset.id] = el.dataset.value)
    return chosenTour
  }
  e.preventDefault()
}

// Retrieve Customer info form the contact cards and display in the checkout form
function addCustomerToCheckout() {
  const customer = document.querySelector('.customer-info')
  const buyer = getFormInputInfo()
  const convertedDate = convertDate(buyer.date)
  let state = buyer.state
  if (state == "N/A") { state = "" }

  const markupTourCard = `
    <h4 class="m-0 mt-3 mb-3 text-underline">Contact Information:</h4>
    <p class="m-0"><span class="customer-first-name">${buyer.firstName}</span>&nbsp;<span class="customer-last-name">${buyer.lastName}</span></p>
    <p class="m-0"><span class="customer-street">${buyer.street}</span></p>
    <p class="m-0"><span class="customer-city">${buyer.city}</span>&nbsp;<span class="customer-state">${state}</span>&nbsp;<span class="customer-zip">${buyer.zip}</span></p>
    <p class="m-0"><span class="customer-country">${buyer.country}</span></p>
    <p class="m-0 mt-1"><span class="customer-email">${buyer.email}</span></p>
    <p class="m-0 mb-3"><span class="customer-phone">+${buyer.phone}</span></p><br>
    <h5>Tour Date: &nbsp;<span class="tour-date">${convertedDate}</span></h5>
  `;
  customer.innerHTML = markupTourCard
}

// Validate email while entering it and when the submit button is pressed
const email = document.getElementById('email')
const firstName = document.getElementById('first-name')
const lastName = document.getElementById('last-name')
const phone = document.getElementById('phone')
const date = document.getElementById('tour-date')
const submitContactBtn = document.getElementById('submit-contact-info')
  
email.addEventListener('keyup', function() {
    validateEmail()
    validateFields()
  })
firstName.addEventListener('keyup', validateFields)
lastName.addEventListener('keyup', validateFields)
phone.addEventListener('keyup', validateFields)
firstName.addEventListener('keyup', validateFields)
date.addEventListener('change', validateFields)
  
  
    submitContactBtn.addEventListener('click', function() {
    console.log('clicked')
    validateFields()
    validateEmail()
  })

function validateEmail() {
  console.log('validating email')
  const emailHelp = document.getElementById('emailHelp')
  const emailRegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  
  email.classList.remove('shake-horizontal')
  
  if (emailRegExp.test(email.value)) {
    email.classList.remove('invalidEmail')
    email.classList.remove('invalidEmail:focus')
    emailHelp.style.display = 'none'
    return true
  } else {
    email.classList.add('invalidEmail')
    email.classList.add('invalidEmail:focus')
    emailHelp.style.display = "block"
    return false
  }
}

function validateFields() {
  const firstName = document.getElementById('first-name')
  const lastName = document.getElementById('last-name')
  const phone = document.getElementById('phone')
  const date = document.getElementById('tour-date')
  if ( firstName.value === ''  ) {
    firstName.classList.add('invalidEmail')
  } else {
    firstName.classList.remove('invalidEmail')
  }
  if ( lastName.value === ''  ) {
    lastName.classList.add('invalidEmail')
  } else {
    lastName.classList.remove('invalidEmail')
  }
  if ( phone.value === ''  ) {
    phone.classList.add('invalidEmail')
  } else {
    phone.classList.remove('invalidEmail')
  }
  if ( date.value === ''  ) {
    date.classList.add('invalidEmail')
  } else {
    date.classList.remove('invalidEmail')
  }
}

function validateForm() {
  if (validateEmail()) {
    checkOut()
  } else {
    email.classList.add('shake-horizontal')
  }
}

// Hide contact modal and show the checkout modal with paypal buttons
function checkOut(){
  addCustomerToCheckout()
  $('#checkoutModal').modal('toggle');
  $('#contactModal').modal('toggle');
}

// Go back button closes the checkout modal and returns to the contact form
$('#goBackBtn').on('click', function() {
  $('#contactModal').modal('toggle');
})

// Target continue to checkout button and prevent the default action
$("#buyer-form").submit(function(e){ e.preventDefault() });

// Prevent customer from choosing past dates
const dt = new Date()
const yyyy = dt.getFullYear().toString()
const mm = (dt.getMonth() + 1).toString() // getMonth() is zero-based
const dd  = dt.getDate().toString()
const min = yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]) // padding
$('#tour-date').prop('min', min)
  
// Add tour cards to the DOM based on the data from datoCMS
function populateCards(packages) {
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
              <a href="#" class="btn btn-warning purchase-tour border-dark" data-toggle="modal" data-target="#contactModal" id="purchase-tour">Buy Now</a>
          </div>
        </div>
      </div>
      `
      cardsDiv.innerHTML += markup
  })
}

// HTTP fecth call to database and retrieving all packages using graphql
function getPackages() {
  // const token = 'DATO_CMS_TOKEN';
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
  getPackages() 
  // $('#checkoutModal').modal('show')
  // $('#contactModal').modal('show') 
  // $('#thankYouModal').modal('show')
} 
init()


  
  