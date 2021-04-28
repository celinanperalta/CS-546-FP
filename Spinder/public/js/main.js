(function () {
  
    const staticForm = document.getElementById('new-user-form');
  
    if (staticForm) {
     
        const username = document.getElementById('username').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const city = document.getElementById('city').value;
        const country = document.getElementById('country').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
  
      // We can take advantage of functional scoping; our event listener has access to its outer functional scope
      // This means that these variables are accessible in our callback
      staticForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        console.log("submitted");
        
      });
    }
  })();
  