import fetch from 'cross-fetch';
const URL_API = 'http://localhost:5001/api/v1/';

$().ready(
  function () {
    $('.filters .amenities input:checkbox').change(function (evnt) {
      checkSelectedAmenities();
    });

    document.querySelector('.filters>button').onclick = loadPlaces;
    checkStatus();
    checkSelectedAmenities();
    loadPlaces();
  }
);

/**
 * find all checkboxes selected in the amenities section and then show its names in a h4
 * @return {void} nothing
 */
function checkSelectedAmenities () {
  const listNames = [];
  const listIds = [];
  $('.filters .amenities input:checked').each((index, element) => {
    listNames.push(element.dataset.name);
    listIds.push(element.dataset.id);
  });
  // show the selected amenities in h4
  $('.filters .amenities>h4').first().text(listNames.join(', '));
  // store the selected items in the element h4
  document.querySelector('.filters .amenities>h4').dataset.ids = listIds;
}

/**
 * fetch the status of the api and show it in the $indicator
 * @return {void} nothing
 */
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

/**
 * fetch places in the api and then call @buildPlaces with the fetch data
 * @return {void} nothing
 */
function loadPlaces () {
  const PATH = 'places_search/';
  const URL = URL_API + PATH;
  let data;

  let amenityList = document.querySelector('.filters .amenities>h4').dataset.ids;
  if (amenityList === '') {
    data = {};
  } else {
    amenityList = amenityList.split(',');
    data = { amenities: amenityList };
  }

  const configPost = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
  fetch(URL, configPost)
    .then(
      (response) => {
        if (response.status === 200) {
          document.querySelector('.places').innerHTML = '';
          response.json()
            .then(buildPlaces);
        }
      }
    )
    .catch(function (err) {
      console.log(err);
      const $indicator = document.querySelector('#api_status');
      $indicator.classList.remove('available');
    });
}

/**
 * Insert in the section places all elements of the given array
 * @param {Array<object>} placesData
 * @return {void} nothing
 */
function buildPlaces (placesData) {
  const fragment = document.createDocumentFragment();

  placesData.forEach(place => {
    const titleBox = createElement('DIV', '', ['title_box']);
    titleBox.appendChild(createElement('H2', place.name));
    titleBox.appendChild(createElement('DIV', place.price_by_night, ['price_by_night']));

    const information = createElement('DIV', '', ['information']);
    // append number guests
    information.appendChild(createElement(
      'DIV',
      place.max_guest + ' Guest' + ((place.max_guest !== 1) ? 's' : ''),
      ['max_guest']
    ));
    // append number rooms
    information.appendChild(createElement(
      'DIV',
      place.number_rooms + ' Room' + ((place.number_rooms !== 1) ? 's' : ''),
      ['number_rooms']
    ));
    // append number bathrooms
    information.appendChild(createElement(
      'DIV',
      place.number_bathrooms + ' Bathroom' + ((place.number_bathrooms !== 1) ? 's' : ''),
      ['number_bathrooms']
    ));

    const description = createElement('DIV', '', ['description']);
    description.innerHTML = place.description;

    const article = createElement('ARTICLE', '');
    article.appendChild(titleBox);
    article.appendChild(information);
    article.appendChild(description);
    fragment.appendChild(article);
  });
  document.querySelector('.places').appendChild(fragment);
}

/**
 * Creates an element HTML with a given tag, textcontent and classes
 * @param {string} tag
 * @param {string} text to be inserted in the created tag
 * @param {Array<string>} className array of classes to be added to new element
 * @return {HTMLElement} created element
 */
function createElement (tag, text, className = []) {
  const newElement = document.createElement(tag);
  newElement.innerText = text;
  className.forEach(className => {
    newElement.classList.add(className);
  });
  return newElement;
}
