const fetch = window.fetch;
const URL_API = 'http://localhost:5001/api/v1/';
const setSelectedStates = new Set();
const setSelectedCities = new Set();
const setSelectedAmenities = new Set();

$().ready(
  function () {
    $('.filters .amenities input:checkbox').change(checkSelectedAmenities);

    $('.filters .locations input:checkbox').change(checkSelectedLocations);

    document.querySelector('.filters>button').onclick = loadPlaces;

    // borra todas las selecciones para
    document.querySelectorAll('input').forEach(e => { e.checked = false; });

    checkStatus();
    loadPlaces();
  }
);

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
        $indicator.classList.delete('available');
      }
    )
    .catch(function (err) {
      if (err) {
        $indicator.classList.delete('available');
      }
    });
}

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
 * find all checkboxes selected in the locations section and then show its names in a h4
 * @return {void} nothing
 */
function checkSelectedLocations (evnt) {
  const h4 = document.querySelector('.filters .locations>h4');
  let setLocations = new Set();
  if (h4.innerText.trim() !== '') {
    setLocations = new Set(h4.innerText.split(', '));
  }

  const { state, cities } = updateLocationsCheckBox(evnt);

  // update the lists of selected states and
  if (state.checked) {
    // add the element state to the array
    setSelectedStates.add(state.dataset.id);
    setLocations.add(state.dataset.name);
    // remove the elements city of the array
    cities.forEach(e => {
      setSelectedCities.delete(e.dataset.id);
      setLocations.delete(e.dataset.name);
    });
  } else {
    // remove the element state of the array
    setSelectedStates.delete(state.dataset.id);
    setLocations.delete(state.dataset.name);
    // add the elements city to the array
    cities.forEach(city => {
      if (city.checked) {
        setSelectedCities.add(city.dataset.id);
        setLocations.add(city.dataset.name);
      } else {
        setSelectedCities.delete(city.dataset.id);
        setLocations.delete(city.dataset.name);
      }
    });
  }

  // show the selected locations in h4
  $('.filters .locations>h4').first().text([...setLocations].join(', '));
}

/**
 * ensure that if all cities are checked, the state too,
 * and if the state are selected, all cities are selected
 * @param {Event} evnt
 * @return {HTMLElement, HTMLCollectionElement} state, cities
 */
function updateLocationsCheckBox (evnt) {
  const target = evnt.target;
  let targetIsState = true;
  let parentElement = target.parentNode.parentNode.parentNode;

  if (parentElement.tagName !== 'LI') {
    targetIsState = false;
    parentElement = parentElement.parentNode;
  }

  const state = parentElement.querySelector('h2 input');
  const cities = parentElement.querySelectorAll('li>label input');

  if (targetIsState) {
    // check all cities of the selected state , or unselect all cities of the unselected state
    if (target.checked) {
      cities.forEach(e => { e.checked = true; });
    } else {
      cities.forEach(e => { e.checked = false; });
    }
  } else {
    // check if all cities of the state was selected, select the state.
    let allCitiesChecked = true;
    for (const city of cities) {
      if (!city.checked) {
        allCitiesChecked = false;
        break;
      }
    }
    if (allCitiesChecked) {
      state.checked = true;
    } else {
      state.checked = false;
    }
  }
  return { state, cities };
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

  if (setSelectedStates.size !== 0) {
    searchedData.states = [...setSelectedStates];
  }

  if (setSelectedCities.size !== 0) {
    searchedData.cities = [...setSelectedCities];
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
      $indicator.classList.delete('available');
    });
}

/**
 * fetch places in the api and then call @buildPlaces with the fetch data
 * @return {void} nothing
 */
function buildPlaces (placesData) {
  // if the list of results is void, show an msg in the wlwmwnr
  if (placesData.length === 0) {
    document.querySelector('.places').appendChild(createElement('H2', 'No Results Found'));
    return;
  }

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

    const reviews = createElement('DIV', '', ['reviews']);
    reviews.appendChild(createElement('H2', 'Reviews'));

    const linkReviews = createElement('a', '', ['show-reviews']);
    linkReviews.appendChild(createElement('SPAN', 'Show'));
    linkReviews.dataset.placeId = place.id;
    linkReviews.onclick = showReviews;

    reviews.appendChild(linkReviews);
    reviews.appendChild(createElement('UL', ''));

    const article = createElement('ARTICLE', '');
    article.appendChild(titleBox);
    article.appendChild(information);
    article.appendChild(description);
    article.appendChild(reviews);
    fragment.appendChild(article);
  });
  document.querySelector('.places').appendChild(fragment);
}

/**
 * fetch the data of the reviwes for the place and show it
 * @param {Event} evnt - the event object generated
 * @return {void} nothing
 */
function showReviews (evnt) {
  const target = evnt.currentTarget;
  if (target.classList.contains('hide-reviews')) {
    // remove all comments in the site
    target.nextSibling.innerHTML = '';

    // togle the view of thee element show review
    target.classList.remove('hide-reviews');
    target.classList.add('show-reviews');
    target.querySelector('span').innerText = 'Show';
  } else {
    // Show the reviews
    // creates the post request

    const URL = URL_API + `places/${target.dataset.placeId}/reviews/`;
    fetch(URL)
      .then(
        (response) => {
          if (response.status === 200) {
            buildReviews(response, target);
          }
        }
      )
      .catch(function (err) {
        console.log(err);
      });

    // togle the view of thee element show review
    target.classList.remove('show-reviews');
    target.classList.add('hide-reviews');
    target.querySelector('span').innerText = 'Hide';
  }
}

/**
 * creates the list of reviews and insert then in the place
 * @param {Response} response - the httpresponse of the fetch
 * @param {HTMLElement} target - the element when the user did click
 * @return {void} nothing
 */
function buildReviews (response, target) {
  response.json()
    .then(data => {
      // build the list of the reviews
      const fragment = document.createDocumentFragment();
      data.forEach(review => {
        // creates each review
        const listItem = createElement('LI', '');

        const reviewDate = new Date(review.created_at);
        listItem.appendChild(createElement('H3', 'From ' + review.user_full_name + ' on ' + reviewDate.toDateString()));

        const paragraph = createElement('P', '');
        paragraph.innerHTML = review.text;
        listItem.appendChild(paragraph);

        fragment.appendChild(listItem);
      });
      target.nextSibling.appendChild(fragment);
    });
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
