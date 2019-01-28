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
          makeApiCall(data);
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
      
      function makeApiCall(data) {
        gapi.client.load('calendar', 'v3', function() {
          // Creat buyer object from form using jQuery .serializeArray
          const myForm = $("form").serializeArray()
              let buyer = {} 
              $.each(myForm, function(i, field){  
                  buyer[field.name] = field.value;  
              });  

              console.log(buyer)
          
          const price = parseInt((document.getElementById('tour-price').innerText), 10).toFixed(2)
          const description = document.getElementById('tour-description').innerText
          const summary = document.getElementById('tour-title').innerText
          const location = document.getElementById('tour-location').innerText
          const orderNumber = data.orderID;

// Email markup for letter to send with Google calendar invite to buyer
const emailMarkup = `
Dear ${buyer.firstName} ${buyer.lastName},

Thank you for choosing to book your adventures with Ocean Tigers Dive House.

<h3>Tour Information:</h3> 
<b>Tour:</b> ${summary}
<b>Summary:</b> ${description}
<b>Tour Dates:</b> ${buyer.date}
<b>Tour Price:</b> ${price}
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
            'summary': `${summary}, ${orderNumber}`,
            'location': location,
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
            'calendarId': 'adriankyzer@gmail.com',
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
}, '#paypal-button-container');

const cardsDiv = document.getElementById('tour-cards')
const cardsHeader = document.getElementById('tour-cards-title')
const checkoutForm = document.querySelectorAll('.checkout')

// Allow date on the date picker to always be today
const date = new Date()
let month = date.getMonth() + 1
if (month < 10) { month = "0" + month }
document.querySelector('.date-picker').value = date.getFullYear() + "-" + month + "-" + date.getDate();

function showCards() {
  cardsDiv.style.display = 'flex'
  cardsHeader.style.display = 'block'
}

function populateCards(packages) {
  console.log(packages)
  packages.forEach(p => {
    const markup = `
      <div class="col-lg-4 col-md-6 mt-3">
        <div class="card mb-3 h-100" id="tourCards">
          <div class="card-body">
            <h5 class="card-title" id="card-tour-name">${p.name}</h5>
            <p class="card-text" id="card-tour-description">${p.description}</p>
            <p class="card-text" id="card-tour-location">${p.location}</p>
            <p class="card-text">$ <span id="card-tour-price">${parseInt(p.price, 10)}</span> USD</p>
          </div>
          <div class="card-body">
              <a href="#" class="btn btn-warning purchase-tour" id="purchase-tour">Buy Now</a>
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
cardsDiv.addEventListener('click', function(e) { 
  e.preventDefault()
  checkOutForm(e) 
})

function checkOutForm(e){
  displayCheckout()  
  hidePackages()
  // Event delegation to find the innerText of targeted card content and display on checkout
  if(e.target.classList.contains('purchase-tour')) {
    const title = e.target.parentElement.parentElement.children[0].children[0].innerText
    const description = e.target.parentElement.parentElement.children[0].children[1].innerText
    const location = e.target.parentElement.parentElement.children[0].children[2].innerText
    const price = e.target.parentElement.parentElement.children[0].children[3].lastElementChild.innerText

    document.getElementById('tour-title').innerText = title
    document.getElementById('tour-description').innerText = description
    document.getElementById('tour-price').innerText = parseInt(price, 10).toFixed(2)
    document.getElementById('tour-location').innerText = location
  }
} 

function init() {
  const token = '';
  hideCheckout() 
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
            }
          }
        `
      }),
    }
  )
  .then(res => res.json())
  .then((res) => {
    console.log(res.data)
    const packages = res.data.allPackages;
    populateCards(packages)
  })
  .catch((error) => {
    console.log(error);
  });
}

init()

