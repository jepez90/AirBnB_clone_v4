const URL_API = 'http://localhost:5001/api/v1/';
const setSelectedAmenities = new Set();

$().ready(
  function () {
    $('.filters .amenities input:checkbox').change(checkSelectedAmenities);

    document.querySelector('.filters>button').onclick = loadPlaces;

    // borra todas las selecciones para
    document.querySelectorAll('input').forEach(e => { e.checked = false; });

    checkStatus();
    loadPlaces();
  }
);

/**
 * find all checkboxes selected in the amenities section and then show its names in a h4
 * @return {void} nothing
 */
function checkSelectedAmenities (evnt) {
  const target = evnt.target;
  const h4 = document.querySelector('.filters .amenities>h4');
  let setNames = new Set();
  if (h4.innerText.trim() !== '') {
    setNames = new Set(h4.innerText.split(', '));
  }

  if (target.checked) {
    setSelectedAmenities.add(target.dataset.id);
    setNames.add(target.dataset.name);
  } else {
    setSelectedAmenities.delete(target.dataset.id);
    setNames.delete(target.dataset.name);
  }
  // show the selected amenities in h4
  h4.innerText = [...setNames].join(', ');
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
  const searchedData = {};

  if (setSelectedAmenities.size !== 0) {
    searchedData.amenities = [...setSelectedAmenities];
  }

  const configPost = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(searchedData)
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
