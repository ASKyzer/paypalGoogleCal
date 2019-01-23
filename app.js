// Set variables to inputs values

const firstName = document.getElementById('first-name')
const lastName = document.getElementById('last-name')
const email = document.getElementById('email')
const phone = document.getElementById('phone')
const street = document.getElementById('street')
const city = document.getElementById('city')
const state = document.getElementById('state')
const zip = document.getElementById('zip')
const price = document.getElementById('tour-price')

const purchaseBtn = document.getElementById('payment')

const paypalURL = 'https://api.sandbox.paypal.com'
const clientID = 'Afpe0-1Q3W1N-qRcIUF_9YyJ7iQXEq9R0_ukkN3Spc_eXoQ9NofkK1h0NAem9rWYUi-cLtOae3iv-r2W'
const secret = 'EBIdByiiddf_rKzy3-vV948HiqkK-JbgrSvls2lAqXsDIUAUhuz4TgDEUKnxsuPtdp0xPe-PtJr9HzAU'

// var paypalForm = document.getElementById('paypalForm');
// paypalForm.style.display = 'none';

// purchaseBtn.addEventListener('click', function(e) {
//   e.preventDefault()
//   console.log('clicked')
//   const buyer = {
//     name: {
//       first: firstName.value,
//       last: lastName.value
//     },
//     email: email.value,
//     phone: phone.value,
//     address: {
//       street: street.value,
//       city: city.value,
//       state: state.value,
//       zip: zip.value
//     }
//   }
//   const paymentPrice = parseInt(price.innerText, 10)

//   console.log(buyer)
//   console.log(paymentPrice)
//   console.log(typeof(paymentPrice))
// })

function start() {
  // 2. Initialize the JavaScript client library.
  gapi.client.init({
    'apiKey': 'AIzaSyB4aEbqul7hayg8PLX0Nq32Rl9wS6Umn5A',
    // Your API key will be automatically added to the Discovery Document URLs.
    'discoveryDocs': ['https://people.googleapis.com/$discovery/rest'],
    // clientId and scope are optional if auth is not required.
    'clientId': '788571287502-qk3rnf535cdk2qhiakno6kiacehp3n3i.apps.googleusercontent.com',
    'scope': 'https://www.googleapis.com/auth/calendar',
  }).then(function() {
    // 3. Initialize and make the API request.
    return gapi.client.people.people.get({
      'resourceName': 'people/me',
      'requestMask.includeField': 'person.names'
    });
  }).then(function(response) {
    console.log(response.result);
  }, function(reason) {
    console.log('Error: ' + reason.result.error.message);
  });
};
// 1. Load the JavaScript client library.
gapi.load('client', start);