"use strict";

const form = document.querySelector(".form");
const workoutsContainer = document.querySelector(".workouts");
const workoutType = document.querySelector(".form__input--type");
const distanceInput = document.querySelector(".form__input--distance");
const durationInput = document.querySelector(".form__input--duration");
const cadenceInput = document.querySelector(".form__input--cadence");
const elevationInput = document.querySelector(".form__input--elevation");

class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-25);

  constructor(coords, duration, distance) {
    this.coords = coords;
    this.duration = duration;
    this.distance = distance;
  }
  _setDescription() {
    // prettier-ignore
    const month = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      month[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = "running";
  constructor(coords, duration, distance, cadence) {
    super(coords, duration, distance);
    this.cadence = cadence;
    this.clacPace();
    this._setDescription();
  }
  clacPace() {
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, duration, distance, elevationGain) {
    super(coords, duration, distance);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}

const run1 = new Running([23, 56], 34, 45, 778);
const cycle1 = new Cycling([-25, 67], 46, 24, 456);
// console.log(run1, cycle1);

class App {
  #map;
  #mapEvent;
  workouts = [];
  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this));
    workoutType.addEventListener("change", this._toggleElevationInput);
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Could not get your position");
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, 10);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    distanceInput.focus();
  }

  _hideForm() {
    distanceInput.value =
      cadenceInput.value =
      durationInput.value =
      elevationInput.value =
        "";
    // form.style.display = "none";
    form.classList.add("hidden");
    // form.style.display = "grid";
  }

  _toggleElevationInput() {
    elevationInput.closest(".form__row").classList.toggle("form__row--hidden");
    cadenceInput.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    //CHech for Valid data
    const validateForm = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    const allPositives = (...inputs) => inputs.every((inp) => inp > 0);

    //get data from the form
    e.preventDefault();
    const inputType = workoutType.value;
    const distance = +distanceInput.value;
    const duration = +durationInput.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    if (inputType === "running") {
      const cadence = +cadenceInput.value;

      if (
        !validateForm(distance, duration, cadence) ||
        !allPositives(distance, duration, cadence)
      )
        return alert("Data has to Positive Numbers only!");
      //If workout type === running >> create a running object
      workout = new Running([lat, lng], duration, distance, cadence);
      // console.log(workout.distance);
      // console.log(workout.duration);
    }

    if (inputType === "cycling") {
      const elevation = +elevationInput.value;
      if (
        !validateForm(distance, duration, elevation) ||
        !allPositives(distance, duration)
      )
        return alert("Data has to be Numbers only!");
      //If workout type === cycling >> create a cycling object
      workout = new Cycling([lat, lng], duration, distance, elevation);
      // console.log(workout.type);
      // console.log(workout.distance);
    }

    //Add the new object to the workout array
    this.workouts.push(workout);
    console.log(this.workouts);
    //Render the workout on the map as marker
    this.renderWorkoutMarker(workout);
    // Render workout on the list
    this.renderWorkout(workout);
    //Clear input and hide form
    this._hideForm();
  }

  renderWorkoutMarker(workout) {
    console.log("submit event fired");
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: "250px",
          minWidth: "100px",
          autoClose: false,
          closeOnClick: false,
          className: "workout__type--running",
        })
      )
      .setPopupContent(`${workout.description}`)
      .openPopup();
  }

  renderWorkout(workout) {
    let workoutBlock = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
              <span class="workout__icon">${
                workout.type === "running" ? `🏃‍♂️` : `🚴‍♀️`
              }</span>
              <span class="workout__value">${workout.duration}</</span>
              <span class="workout__unit">M</span>
            </div>
    `;
    if (workout.type === "running")
      workoutBlock += `
            <div class="workout__details">
              <span class="workout__icon">⚡️</span>
              <span class="workout__value">${workout.pace.toFixed(1)}</span>
              <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">🦶🏼</span>
              <span class="workout__value">${workout.cadence}</span>
              <span class="workout__unit">s/m</span>
            </div>
          </li>`;

    if (workout.type === "cycling")
      workoutBlock += `
            <div class="workout__details">
              <span class="workout__icon">⚡️</span>
              <span class="workout__value">${workout.speed.toFixed(1)}</span>
              <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon"> ⛰ </span>
              <span class="workout__value">${workout.elevationGain}</span>
              <span class="workout__unit">m</span>
            </div>
          </li>`;
    const workoutList = document.querySelector(".workout__types");
    workoutList.insertAdjacentHTML("afterbegin", workoutBlock);
    // workoutList.innerHTML += workoutBlock;
    console.log(workoutBlock);
  }
}

const app = new App();
// app._getPosition();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*let map, mapEvent;
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { longitude } = position.coords;
      const { latitude } = position.coords;
      const coords = [longitude, latitude];
      console.log(coords);
      map = L.map("map").setView(coords, 10); //20 is the zoom level on the map
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      //Placing the marker wherever the user clicks using the leaflet events itself not the onevent or addeventlistener by Javascript
      console.log(map);
      map.on("click", function (mapE) {
        mapEvent = mapE;
        form.classList.remove("hidden");
        distanceInput.focus();
      });
    },
    function () {
      alert("could not get your position");
    }
  );
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  distanceInput.value =
    cadenceInput.value =
    durationInput.value =
    elevationInput.value =
      "";
  console.log("submit event fired");
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: "200px",
        minWidth: "100px",
        autoClose: false,
        closeOnClick: false,
        className: "workout__type--running",
      })
    )
    .setPopupContent("Workout")
    .openPopup();
});

workoutType.addEventListener("change", () => {
  cadenceInput.closest(".form__row").classList.toggle("form__row--hidden");
  elevationInput.closest(".form__row").classList.toggle("form__row--hidden");
}); */

//Local Storage  is a very simple API which is only used to store small amounts of data; It is also blocking so using it to store large amount of data is bad as it will slow down the application
