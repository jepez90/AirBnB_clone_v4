const fetch = window.fetch;
const URL_API = 'http://localhost:5001/api/v1/';

$().ready(
  function () {
    $('.filters .amenities input:checkbox').change(function (evnt) {
      checkAmenities();
    });
    checkStatus();
  }
);

function checkAmenities () {
  const list = [];
  $('.filters .amenities input:checked').each((index, element) => {
    list.push(element.dataset.name);
  });
  $('.filters .amenities>h4').text(list.join(', '));
}

function checkStatus () {
  const PATH = 'status/';
  const URL = URL_API + PATH;
  const $indicator = document.querySelector('#api_status');
  fetch(URL)
    .then(
      (response) => {
        if (response.status === 200) {
          $indicator.classList.add('available');
          return;
        }
        $indicator.classList.remove('available');
      }
    )
    .catch(function (err) {
      if (err) {
        $indicator.classList.remove('available');
      }
    });
}
