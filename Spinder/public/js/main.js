validateRegistrationForm = function() {
    
    const staticForm = document.getElementById('new-user-form');
  
    if (staticForm) {
     
        const username = document.getElementById('username');
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const city = document.getElementById('city');
        const country = document.getElementById('country');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirm-password');


    if (password.value !== confirmPassword.value) {
        console.log("Bad");
        return false;
    }

    console.log("OK");
    return true;

    }

    return false;
  };
  