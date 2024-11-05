// Shared typo corrections
var commonTypos = {
    "gmail.con": "gmail.com",
    "gmail.co": "gmail.com",
    "gamil.com": "gmail.com",
    "gmai.com": "gmail.com",
    "yahoo.con": "yahoo.com",
    "yaho.com": "yahoo.com",
    "hotmail.con": "hotmail.com",
    "hotmai.com": "hotmail.com",
    "outlook.con": "outlook.com",
    "outloo.com": "outlook.com",
  };
  
  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("subscribeForm");
    var emailInput = document.getElementById("emailInput");
    var formMessage = document.getElementById("formMessage");
  
    function validateEmail(email) {
      console.log("DEBUG: Validating email:", email);
  
      var re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      var regexResult = re.test(String(email).toLowerCase());
      console.log("DEBUG: Regex test result:", regexResult);
  
      if (!regexResult) {
        console.log("DEBUG: Email failed regex validation");
        return false;
      }
  
      var parts = email.split("@");
      var domain = parts[1].toLowerCase();
      console.log("DEBUG: Domain being checked:", domain);
  
      // Explicitly validate gmail.com
      if (domain === "gmail.com") {
        console.log("DEBUG: Valid gmail.com address");
        return true;
      }
  
      if (commonTypos.hasOwnProperty(domain)) {
        console.log("DEBUG: Domain flagged as typo:", domain);
        var suggestion = parts[0] + "@" + commonTypos[domain];
        console.log("DEBUG: Suggesting correction:", suggestion);
        return suggestion;
      }
  
      if (domain.endsWith(".con")) {
        console.log("DEBUG: Domain ends with .con");
        return false;
      }
  
      console.log("DEBUG: Email considered valid");
      return true;
    }
  
    function showMessage(message, isError = false) {
      console.log("DEBUG: Showing message:", message, "isError:", isError);
      formMessage.textContent = message;
      formMessage.style.color = "var(--text-color)";
    }
  
    function suggestCorrection(email) {
      console.log("DEBUG: Suggesting correction for:", email);
  
      var parts = email.split("@");
      var domain = parts[1].toLowerCase();
      console.log("DEBUG: Domain for correction:", domain);
  
      if (commonTypos.hasOwnProperty(domain)) {
        var suggestion = parts[0] + "@" + commonTypos[domain];
        console.log("DEBUG: Typo found, suggesting:", suggestion);
        return suggestion;
      }
  
      if (domain.endsWith(".con")) {
        console.log("DEBUG: Correcting .con to .com");
        var suggestion = email.slice(0, -3) + "com";
        console.log("DEBUG: Suggesting correction:", suggestion);
        return suggestion;
      }
  
      console.log("DEBUG: No correction suggested");
      return null;
    }
  
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        console.log("DEBUG: Form submitted");
  
        var email = emailInput.value.trim();
        console.log("DEBUG: Trimmed email:", email);
  
        if (!email) {
          showMessage("Please enter an email address.", true);
          return;
        }
  
        var validationResult = validateEmail(email);
        console.log("DEBUG: Validation result:", validationResult);
  
        if (validationResult !== true) {
          var message = "Please enter a valid email address.";
          if (typeof validationResult === "string") {
            message += " Did you mean " + validationResult + "?";
            console.log(
              "DEBUG: Showing correction from validateEmail:",
              validationResult,
            );
          } else {
            var suggestion = suggestCorrection(email);
            console.log("DEBUG: Suggestion result:", suggestion);
            if (suggestion) {
              message += " Did you mean " + suggestion + "?";
              console.log(
                "DEBUG: Showing correction from suggestCorrection:",
                suggestion,
              );
            }
          }
          showMessage(message, true);
          return;
        }
  
        var formData = new FormData(form);
        var url =
          "https://docs.google.com/forms/d/e/1FAIpQLSfG3qq6S5Y1CK5G9Vv-MVoVlpSrXb5nhZWedazSMgi3oNz-Pg/formResponse";
  
        fetch(url, {
          method: "POST",
          mode: "no-cors",
          body: formData,
        })
          .then(() => {
            showMessage("Subscription confirmed.");
            form.reset();
          })
          .catch((error) => {
            showMessage("Something went wrong. Please try again later.", true);
            console.error("DEBUG: Error:", error);
          });
      });
  
      emailInput.addEventListener("blur", function () {
        var email = this.value.trim();
        var validationResult = validateEmail(email);
        if (email && validationResult !== true) {
          var message = "Please enter a valid email address.";
          if (typeof validationResult === "string") {
            message += " Did you mean " + validationResult + "?";
          } else {
            var suggestion = suggestCorrection(email);
            if (suggestion) {
              message += " Did you mean " + suggestion + "?";
            }
          }
          showMessage(message, true);
        } else {
          formMessage.textContent = "";
        }
      });
    }
  });
  