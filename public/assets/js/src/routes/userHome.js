// Components
import SearchingText from "../components/Home/SearchingText.js";
import SearchingForOpponent from "../components/Home/SearchingForOpponent.js";
import Cookie from "../helpers/Cookie.js";

// Socket
import Token from "../io/auth/Token.js";
import clientSocketConnect, { socket } from '../io/client.js';


// changing map button appearance according to map selection
let selectedMap = Cookie.get("selectedMap");
let mapButton = document.querySelector("img.map-button");
console.log(selectedMap);
if (selectedMap === "playground") {
  mapButton.src = "/assets/img/backgrounds/SVG/playground-button.svg";
} else if (selectedMap === "pigeon-nights") {
  mapButton.src = "/assets/img/backgrounds/SVG/night-button.svg";
} else if (selectedMap === "street") {
  mapButton.src = "/assets/img/backgrounds/SVG/street-button.svg";
}

// Reloads page if accessed from cache
window.addEventListener("pageshow", function (event) {
  let historyTraversal = event.persisted;
  if (historyTraversal) {
    window.location.reload();
  }
});

document.querySelector("body").addEventListener('click', async function (event) {
  let target = event.target;
  console.log('click target:', target);

  /* Play Online or Offline */
  if (target.classList.contains("playOnlineBtn")) { // Play Online
   
    // Connect to the web socket.
    const socket = await clientSocketConnect();

    // Show the "Finding an opponent" text block and start animating it for searching
    SearchingText.show();
    SearchingForOpponent.animate();

    // Show blue clouds
    const blueClouds = document.querySelector(".loading-clouds-noBK-overlay");
    blueClouds.classList.remove("d-none");
    blueClouds.classList.add("animate__fadeIn");

    // Handle any socket connection error.
    socket.on('connect_error', socketError => {
      console.log(socketError); // debug

      let errMessage = socketError.errMessage;
      let userErrorMessage = socketError.userErrorMessage ?? "Something wrong happened!";

      if (errMessage === "AUTHENTICATION_FAILED") {
        location.href = "/";
        return;
      }
      switch (errMessage) {
        case "AUTHENTICATION_FAILED":
          location.href = "/";
          return;
        case "PLAYER_ALREADY_IN_MATCH_QUEUE":
          console.log("Player is already in the match queue"); // debug TODO: let the user know as well.
          return;
        default:
          console.log("Unhandled: ", errMessage);
          break;
      }

      //SearchingForOpponent.clearAnimation();
      //SearchingText.DOMElement.innerHTML = userErrorMessage;

    });

    socket.emit("game:searchForOpponent");
  } else if (target.classList.contains("playOfflineBtn")) { // Play Offline
    console.log('play offline hit');
  
    const playerUsername = Token.username;
    // Token.saveEmailAndUsername(null, playerUsername);
    console.log('window.location.href', window.location.href);
    let tID = setTimeout(function () {
      window.location.href = "/play";
      window.clearTimeout(tID);		// clear time out.
    }, 1350);
  }

  /* Customize Pigeon */
  if (target.classList.contains('customizePigeon-button')) {
    location.href = '/customizePigeon';
  }

  /* Change Arena (mapselection) */
  if (target.classList.contains('map-button')) {
    location.href = '/mapselection';
  }

  /* Analyze Gameplay (profile) */
  if (target.classList.contains('stats-button')) {
    location.href = '/profile';
  }

  /* Logout Button */
  if (target.classList.contains('logout-button')) {
    Cookie.destroy('JWT');
    Cookie.destroy('email');
    Cookie.destroy('user');
    Cookie.destroy('guestId');
    Cookie.destroy('selectedMap');
    location.href = '/';
  }

});