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
      console.log("payment went through")
      console.log(data)

      const clientId = '';
      const apiKey = '';
      const scopes = 'https://www.googleapis.com/auth/calendar';
            
      handleAuth();    

      function handleClientLoad() {
        gapi.client.setApiKey(apiKey);
        window.setTimeout(checkAuth,1);
        checkAuth();
      }

      function checkAuth() {
        console.log("checkAuth function")
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true},
            handleAuthResult);
      }

      function handleAuthResult(authResult) {
        console.log("handAuthResult function")
        var authorizeButton = document.getElementById('authorize-button');
        if (authResult) {
          // authorizeButton.style.visibility = 'hidden';
          makeApiCall(data);
        } else {
          // authorizeButton.style.visibility = '';
          // authorizeButton.onclick = handleAuthClick;
          alert('Event not generated')
        }
      }

      function handleAuth(event) {
        console.log("handleAuth function")
        gapi.auth.authorize(
            {client_id: clientId, scope: scopes, immediate: true},
            handleAuthResult);
        return false;
      }

      function makeApiCall(data) {
        console.log("making api call")
        gapi.client.load('calendar', 'v3', function() {
          // get value for all form and tour fields
          const firstName = document.getElementById('first-name')
          const lastName = document.getElementById('last-name')
          const email = document.getElementById('email')
          const phone = document.getElementById('phone')
          const street = document.getElementById('street')
          const street2 = document.getElementById('street2')
          const city = document.getElementById('city')
          const state = document.getElementById('state')
          const zip = document.getElementById('zip')
          const country = document.getElementById('country')
          const price = parseInt((document.getElementById('tour-price').innerText), 10).toFixed(2)
          const description = document.getElementById('tour-description').innerText
          const summary = document.getElementById('tour-title').innerText
          const location = document.getElementById('tour-location').innerText
          const startDate = document.getElementById('tour-start-date').innerText
          const endDate = document.getElementById('tour-end-date').innerText

          const orderNumber = data.orderID;

          const buyer = {
              name: {
                first: firstName.value,
                last: lastName.value
              },
              email: email.value,
              phone: phone.value,
              address: {
                street: street.value,
                street2: street2.value,
                city: city.value,
                state: state.value,
                zip: zip.value,
                country: country.value
              },
              order: {
                orderID: data.orderID,
                payerID: data.payerID,
                paymentID: data.paymentID
              }
            }

            console.log(buyer)


const emailMarkup = `
Dear ${buyer.name.first} ${buyer.name.last},

Thank you for choosing to book your adventures with Ocean Tigers Dive House.

<h3>Tour Information:</h3> 
<b>Tour:</b> ${summary}
<b>Summary:</b> ${description}
<b>Tour Dates:</b> ${startDate} to ${endDate}
<b>Tour Price:</b> ${price}
<b>Order No.:</b> ${orderNumber}

<h3>Your Information:</h3>
<b>Name:</b> ${buyer.name.first} ${buyer.name.last}
<b>Address:</b> ${buyer.address.street} 
              ${buyer.address.city}, ${buyer.address.state} ${buyer.address.zip}, ${buyer.address.country}
<b>Email:</b> ${buyer.email}
<b>Phone:</b> ${buyer.phone}

Please review the information above and if anything is incorrect, or if you have any additional questions, please email us at oceantigersdivehouse@gmail.com.  

We look forward to joining you in this incredible adventure.

Sincerely,

The Ocean Tigers Dive House Staff
`;

console.log(emailMarkup);

          const event = {
            // 'id': eventID,
            'summary': `${summary}, ${orderNumber}`,
            'location': location,
            'description': emailMarkup,
            'start': {
              'date': startDate,
              'timeZone': 'America/Los_Angeles'
            },
            'end': {
              'date': endDate,
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
          console.log(event)
          
          request.execute(function(event) {
            console.log(event)
            console.log("Event inserted successfully into OTDH calendar and email sent to the buyer.")
          });
        });
      }
    });
  }
}, '#paypal-button-container');