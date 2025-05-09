document.onreadystatechange = function() {
  if (document.readyState === 'interactive') renderApp();

  function renderApp() {
    const onInit = app.initialized();

    onInit
      .then(function getClient(_client) {
        window.client = _client;
        client.events.on('app.activated', renderContactName);
        setupFormSubmission();
        setupQ5Change();
      })
      .catch(handleErr);
  }
};

function renderContactName() {
  const textElement = document.getElementById('apptext');
  if (textElement) {
    client.data
      .get('requester')
      .then(function(payload) {
        textElement.innerHTML = `Data Method returned: ${payload.requester.name}`;
      })
      .catch(handleErr);
  }
}

function setupFormSubmission() {
  const form = document.getElementById('riskAssessmentForm');
  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Get form values safely
      const q1Element = document.querySelector('input[name="q1"]:checked');
      const q2Element = document.querySelector('input[name="q2"]:checked');
      const q3Element = document.querySelector('input[name="q3"]:checked');
      const q4Element = document.querySelector('input[name="q4"]:checked');
      const q5Element = document.querySelector('input[name="q5"]:checked');
      const q5NoReasonElement = document.getElementById('q5NoReasonText');
      
      const q1 = q1Element ? q1Element.value : 'low';
      const q2 = q2Element ? q2Element.value : 'low';
      const q3 = q3Element ? q3Element.value : 'yes';
      const q4 = q4Element ? q4Element.value : 'yes';
      const q5 = q5Element ? q5Element.value : 'yes';
      const q5NoReason = q5NoReasonElement ? q5NoReasonElement.value : '';

      client.data.get('ticket').then(function(ticket) {
        const ticketId = ticket.ticket.id;
        const customFields = {
          'cf_risk_impact': q1,
          'cf_risk_likelihood': q2,
          'cf_rollback_plan': q3,
          'cf_tested_in_lower_env': q4,
          'cf_validation_possible': q5,
          'cf_validation_no_reason': q5NoReason
        };

        client.request.update('ticket', ticketId, { custom_fields: customFields })
          .then(function() {
            showNotification('Risk assessment saved successfully!');
          })
          .catch(handleErr);
      }).catch(handleErr);
    });
  }
}

function setupQ5Change() {
  const q5Element = document.getElementById('q5');
  if (q5Element) {
    q5Element.addEventListener('change', function() {
      const q5NoReasonDiv = document.getElementById('q5NoReason');
      if (q5NoReasonDiv) {
        if (this.value === 'no') {
          q5NoReasonDiv.style.display = 'block';
        } else {
          q5NoReasonDiv.style.display = 'none';
        }
      }
    });
  }
}

function handleErr(err = 'None') {
  console.error(`Error occurred. Details:`, err);
}

function showNotification(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000); // Hide after 3 seconds
  }
}

// Export functions for testing
if (typeof module !== 'undefined') {
  module.exports = {
    renderContactName,
    setupFormSubmission,
    setupQ5Change,
    handleErr,
    showNotification
  };
}
