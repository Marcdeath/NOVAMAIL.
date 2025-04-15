function generateRandomEmail() {
    const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    let localPart = '';
    for (let i = 0; i < 10; i++) {
      localPart += chars[Math.floor(Math.random() * chars.length)];
    }
    return `${localPart}@novamail.africa`;
  }
  
  function copyEmail() {
    const emailInput = document.getElementById("emailAddress");
    emailInput.select();
    emailInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(emailInput.value);
    alert("Adresse copiée : " + emailInput.value);
  }
  
  function startTimer(duration, display, callback) {
    let timer = duration, minutes, seconds;
    const interval = setInterval(() => {
      minutes = Math.floor(timer / 60);
      seconds = timer % 60;
  
      display.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  
      if (--timer < 0) {
        clearInterval(interval);
        callback(); // regénère une nouvelle adresse
      }
    }, 1000);
  }
  
  function generateEmail() {
    const newEmail = generateRandomEmail();
    document.getElementById("emailAddress").value = newEmail;
    sessionStorage.setItem("currentEmail", newEmail);
  
    // Enregistrement côté serveur
    fetch('http://localhost:3000/generate')
      .then(res => res.json())
      .then(() => {
        startTimer(600, document.getElementById("timer"), () => {
          deleteEmail(newEmail);
          generateEmail();
        });
        fetchInbox(newEmail); // Charger les emails à la génération
      })
      .catch(err => console.error("Erreur génération serveur :", err));
  }
  
  function deleteEmail(email) {
    fetch('http://localhost:3000/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(data => console.log("Email supprimé :", data))
      .catch(err => console.error("Erreur suppression :", err));
  }
  
  function fetchInbox(email) {
    fetch(`http://localhost:3000/api/messages/${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(messages => {
        const inbox = document.querySelector('.inbox');
        const empty = document.querySelector('.inbox-empty');
        const header = document.querySelector('.inbox-header');
  
        if (messages.length === 0) {
          empty.style.display = 'block';
          header.style.display = 'none';
          return;
        }
  
        empty.style.display = 'none';
        header.style.display = 'flex';
        const existing = document.querySelectorAll('.inbox-message');
        existing.forEach(e => e.remove());
  
        messages.forEach(msg => {
          const row = document.createElement('div');
          row.classList.add('inbox-message');
          row.innerHTML = `
            <span>${msg.sender}</span>
            <span>${msg.subject}</span>
            <span>${msg.preview}</span>
          `;
          inbox.appendChild(row);
        });
      })
      .catch(err => console.error("Erreur récupération boîte :", err));
  }
  
  window.onload = () => {
    const savedEmail = sessionStorage.getItem("currentEmail");
    if (savedEmail) {
      document.getElementById("emailAddress").value = savedEmail;
      startTimer(600, document.getElementById("timer"), () => {
        deleteEmail(savedEmail);
        generateEmail();
      });
      fetchInbox(savedEmail);
    } else {
      generateEmail();
    }
  };
  