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
    const price = document.querySelector('#tour-price')
    console.log(price)
    const paymentPrice = parseInt(price.innerText, 10)
    return actions.payment.create({
      payment: {
        transactions: [
          {
            amount: {
              total: paymentPrice,
              currency: 'USD'
            }
          }
        ]
      }
    });
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
            const orderNumber = data.orderID
  
// Email markup for letter to send with Google calendar invite to buyer
const emailMarkup = `
Dear ${buyer.firstName} ${buyer.lastName},

Thank you for choosing to book your adventures with Ocean Tigers Dive House.

<h3>Tour Information:</h3> 
<b>Tour:</b> ${tour.title}
<b>Summary:</b> ${tour.description}
<b>Tour Dates:</b> ${buyer.date}
<b>Tour Price: $</b> ${tour.price.toFixed(2)} USD
<b>Order No.:</b> ${orderNumber}

<h3>Your Information:</h3>
<b>Name:</b> ${buyer.firstName} ${buyer.lastName}
<b>Address:</b> ${buyer.street} 
              ${buyer.city}, ${buyer.state} ${buyer.zip}, ${buyer.country}
<b>Email:</b> ${buyer.email}
<b>Phone:</b> ${buyer.phone}

Please review the information above and if anything is incorrect, or if you have any additional questions, please email us at oceantigersdivehouse@gmail.com.  

We look forward to joining you in this incredible adventure.

Sincerely,

The Ocean Tigers Dive House Staff

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
            });
            
            request.execute(function(event) {
              console.log(event)
            });
          });
        }
        hideCheckout()
        showPackages()
      });
    }
  }, '#paypal-button-container')
  
  const cardsDiv = document.getElementById('tour-cards')
  const cardsHeader = document.getElementById('tour-cards-title')
  const checkoutForm = document.querySelectorAll('.checkout')
  const contactForm = document.querySelector('.contact-form')
  const contactSubmit = document.getElementById('submit-contact-info')
  
  function hideContactForm() { contactForm.style.display = 'none' }
  function showContactForm() { contactForm.style.display = 'block' }

  // jQuery serializeArray() to target form and put the name: value fields to return data object
  function getFormInputInfo() {
    const myForm = $("form").serializeArray()
    const formData = {}
      $.each(myForm, function(i, field){ formData[field.name] = field.value })
      return formData
  }

  function purchasedTourInfo() {
    const tourTitle = document.querySelector('#tour-title')
    const tourDescription = document.querySelector('#tour-description')
    const tourLocation = document.querySelector('#tour-location')
    const tourPrice = document.querySelector('#tour-price')

    console.log(tourPrice, tourDescription, tourTitle, tourLocation)
    return {
      price: parseFloat(tourPrice.innerText),
      description: tourDescription.innerText,
      title: tourTitle.innerText,
      location: tourLocation.innerText
    } 
  }

  function hidePackages() {
    cardsDiv.style.display = 'none'
    cardsHeader.style.display = 'none'
  }
  function showPackages() {
    cardsDiv.style.display = 'flex'
    cardsHeader.style.display = 'block'
  }
  
  function populateCards(packages) {
    packages.forEach(p => {
      const markup = `
        <div class="col-lg-4 col-md-6 mt-3">
          <div class="card mb-3 h-100" id="tourCards">
            <img src="${p.imageUrl}" data-value="${p.imageUrl}" data-id="imageUrl" class="card-img-top tour" alt="${p.name}">
            <h5 class="card-header tour pl-4 pr-4 pt-2 pb-2 bg-warning border-dark" data-value="${p.name}" data-id="title" id="card-tour-title">${p.name}</h5>
            <div class="card-body">
              <p class="card-text tour" data-value="${p.description}" data-id="description" id="card-tour-description">${p.description}</p>
              <p class="card-text tour" data-value="${p.location}" data-id="location" id="card-tour-location">${p.location}</p>
              <p class="card-text">$ <span class="tour tour-price" data-value="${parseFloat(p.price)}" data-id="price" id="card-tour-price">${parseFloat(p.price)}</span> USD</p>
            </div>
            <div class="p-4">
                <a href="#" class="btn btn-warning purchase-tour border-dark" data-toggle="modal" data-target="#exampleModalLong" id="purchase-tour">Buy Now</a>
            </div>
          </div>
        </div>
        `
        cardsDiv.innerHTML += markup;
    })
  }
  
  function hideCheckout() { checkoutForm.forEach(el => el.style.display = 'none') }
  function displayCheckout() { checkoutForm.forEach(el => el.style.display = 'block') }
  
  // Listen for Buy Now click event
  cardsDiv.addEventListener('click', openContactForm) 

  function openContactForm(e) {
    const tour = getChosenTourInfo(e)
    // hidePackages()
    showContactForm()
    addTourToCheckout(tour)
  }

  function addTourToCheckout(tour) {
    console.log(tour)
    const shoppingCart = document.querySelectorAll('.shopping-cart')
    const markup = `
        <div class="">
          <div class="card mb-3 h-100" id="tourCards">
            <img src="${tour.imageUrl}" data-value="${tour.imageUrl}" data-id="imageUrl" class="card-img-top tour" alt="${tour.title}">
            <h5 class="card-header tour pl-4 pr-4 pt-2 pb-2 bg-warning border-dark" data-value="${tour.title}" data-id="title" id="tour-title">${tour.title}</h5>
            <div class="card-body">
              <p class="card-text tour" data-value="${tour.description}" data-id="description" id="tour-description">${tour.description}</p>
              <p class="card-text tour" data-value="${tour.location}" data-id="location" id="tour-location">${tour.location}</p>
              <p class="card-text">$ <span class="tour" data-value="${parseFloat(tour.price)}" data-id="price" id="tour-price">${parseFloat(tour.price)}</span> USD</p>
            </div>
          </div>
        </div>
        `
    shoppingCart.forEach(el => el.innerHTML = markup)
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

  function addCustomerToCheckout() {
    const customer = document.querySelector('.customer-info')
    const buyer = getFormInputInfo()
    const convertedDate = convertDate(buyer.date)

    const markup = `
      <h4 class="m-0 mt-3 mb-3 text-underline">Contact Information:</h4>
      <p class="m-0"><span class="customer-first-name">${buyer.firstName}</span>&nbsp;<span class="customer-last-name">${buyer.lastName}</span></p>
      <p class="m-0"><span class="customer-street">${buyer.street}</span></p>
      <p class="m-0"><span class="customer-city">${buyer.city}</span>&nbsp;<span class="customer-state">${buyer.state}</span>&nbsp;<span class="customer-zip">${buyer.zip}</span></p>
      <p class="m-0"><span class="customer-country">${buyer.country}</span></p>
      <p class="m-0"><span class="customer-email">${buyer.email}</span></p>
      <p class="m-0 mb-3"><span class="customer-phone">${buyer.phone}</span></p><br>
      <h5>Tour Date: &nbsp;<span class="tour-date">${convertedDate}</span></h5>
    `;

    customer.innerHTML = markup
  }
  
  // Hide contact for and show the checkout with paypal buttons
  function checkOut(){
    addCustomerToCheckout()
    hideContactForm()
    displayCheckout()
  } 

  // Target continue to checkout button and prevent the default action
  $("#buyer-form").submit(function(e){ e.preventDefault(); });
  
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
      const packages = res.data.allPackages;
      populateCards(packages)
    })
    .catch((error) => {
      console.log(error);
    });
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
    hideCheckout()
    hideContactForm()
  }
  init()
  
  
  