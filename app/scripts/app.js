document.onreadystatechange = function() {
  if (document.readyState === 'interactive') renderApp();

  function renderApp() {
    const onInit = app.initialized();

    onInit
      .then(function getClient(_client) {
        window.client = _client;
        client.events.on('app.activated', renderContactName);
        setupFormSubmission();
      })
      .catch(handleErr);
  }
};

function renderContactName() {
  const textElement = document.getElementById('apptext');
  client.data
    .get('requester')
    .then(function(payload) {
      textElement.innerHTML = `Data Method returned: ${payload.requester.name}`;
    })
    .catch(handleErr);
}

function setupFormSubmission() {
  const form = document.getElementById('riskAssessmentForm');
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    const q1 = document.getElementById('q1').value;
    const q2 = document.getElementById('q2').value;
    const q3 = document.getElementById('q3').value;
    const q4 = document.getElementById('q4').value;
    const q5 = document.getElementById('q5').value;
    const q5NoReason = document.getElementById('q5NoReasonText').value;

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
          alert('Risk assessment saved successfully!');
        })
        .catch(handleErr);
    }).catch(handleErr);
  });
}

function handleErr(err = 'None') {
  console.error(`Error occurred. Details:`, err);
}

document.getElementById('q5').addEventListener('change', function() {
  const q5NoReasonDiv = document.getElementById('q5NoReason');
  if (this.value === 'no') {
    q5NoReasonDiv.style.display = 'block';
  } else {
    q5NoReasonDiv.style.display = 'none';
  }
});
