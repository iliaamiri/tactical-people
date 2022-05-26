import Token from "../io/auth/Token.js";

const emailInput = document.querySelector('input.emailInput');
const usernameInput = document.querySelector('input.usernameInput');
const passwordInput = document.querySelector('input.passwordInput');

// Reloads page if accessed from cache
window.addEventListener("pageshow", function (event) {
  let historyTraversal = event.persisted;
  if (historyTraversal) {
    window.location.reload();
  }
});

document.querySelector("body").addEventListener('click', async function (event) {
  let target = event.target;

  /* ---- Sign Up Button ---- */
  if (target.tagName === "BUTTON" && target.classList.contains("sign-up-button")) {
    try {
      const signUpResponse = await axios.post("/api/auth/signup", {
        givenEmail: emailInput.value,
        givenUsername: usernameInput.value,
        givenPassword: passwordInput.value
      });

      const authResult = signUpResponse.data;
      console.log('signup authResult:', authResult);
      if (!authResult.status) {
        // console.log(authResult); // debug
        throw new Error(authResult.error);
      }

      const tokenValue = authResult.tokenValue;
      const username = authResult.username;

      Token.save(tokenValue);
      Token.saveUsername(username);
      
      location.href = '/profile';
    } catch (error) {
      let errMessage = error.message;
      console.log(errMessage);
    }
  }

  /* ---- Index Page Link ---- */
  if (target.tagName === "P" && target.classList.contains('index-link')) {
    location.href = '/';
  }
});