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
    const price = document.getElementById('tour-price')
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
        const clientId = '';
        const apiKey = '';
        const scopes = 'https://www.googleapis.com/auth/calendar';
        
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
<b>Tour Date:</b> ${buyer.date}
<b>Tour Price: </b>$ ${tour.price}
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
        showCards()
      });
    }
  }, '#paypal-button-container')
  
  const cardsDiv = document.getElementById('tour-cards')
  const cardsHeader = document.getElementById('tour-cards-title')
  const checkoutForm = document.querySelectorAll('.checkout')
  
  function getFormInputInfo() {
    const myForm = $("form").serializeArray()
    const data = {}
      $.each(myForm, function(i, field){ data[field.name] = field.value })
      return data
  }

  function purchasedTourInfo() {
    return {
      price:  parseFloat(document.getElementById('tour-price').innerText),
      description: document.getElementById('tour-description').innerText,
      title: document.getElementById('tour-title').innerText,
      location: document.getElementById('tour-location').innerText
    } 
  }

  function showCards() {
    cardsDiv.style.display = 'flex'
    cardsHeader.style.display = 'block'
  }
  
  function populateCards(packages) {
    packages.forEach(p => {
      const markup = `
        <div class="col-lg-4 col-md-6 mt-3">
          <div class="card mb-3 h-100" id="tourCards">
            <img src="${p.imageUrl}" class="card-img-top" alt="${p.name}">
            <h5 class="card-header tour pl-4 pr-4 pt-2 pb-2 bg-warning border-dark" data-id="title" id="card-tour-name">${p.name}</h5>
            <div class="card-body">
              <p class="card-text tour" data-id="description" id="card-tour-description">${p.description}</p>
              <p class="card-text tour" data-id="location" id="card-tour-location">${p.location}</p>
              <p class="card-text">$ <span class="tour" data-id="price" id="card-tour-price">${parseFloat(p.price)}</span> USD</p>
            </div>
            <div class="p-4">
                <a href="#" class="btn btn-warning purchase-tour border-dark" id="purchase-tour">Buy Now</a>
            </div>
          </div>
        </div>
        `
        cardsDiv.innerHTML += markup;
    })
  }
  
  function hideCheckout() {
      for (let i = 0; i < checkoutForm.length; i++) { checkoutForm[i].style.display = 'none' }
  }
  
  function displayCheckout() {
    for (let i = 0; i < checkoutForm.length; i++) { checkoutForm[i].style.display = 'block' }
  }
  
  function hidePackages() {
    cardsDiv.style.display = 'none'
    cardsHeader.style.display = 'none'
  }
  
  // Listen for Buy Now click event
 $(cardsDiv).on('click', getChosenTourInfo) 
  
  function addTourToCheckout(tour) {
    document.getElementById('tour-title').innerText = tour.title
    document.getElementById('tour-description').innerText = tour.description
    document.getElementById('tour-price').innerText = parseFloat(tour.price).toFixed(2)
    document.getElementById('tour-location').innerText = tour.location
  }
  
  function getChosenTourInfo(e) {
    // Target card and see if there's a buy now button and then target the classes for their values???
    if(e.target.classList.contains('purchase-tour')) {
      const data = (event.target).closest('#tourCards').querySelectorAll('.tour')
      let chosenTour = {}
      data.forEach(el => chosenTour[el.dataset.id] = el.innerText )
      checkOut(chosenTour)
    }
    e.preventDefault()
  }
  
  function checkOut(tour){
      addTourToCheckout(tour)
      hidePackages()
      displayCheckout()
    } 
  
  function getPackages() {
    const token = '';
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
  
  function init() {
    getPackages()
    hideCheckout()
  }
  init()
  
  
  