// Import functions from the app.js module
const appModule = require('./app.js');

// Create a proper mock for the entire client object
function setupMockClient() {
  return {
    events: {
      on: jest.fn()
    },
    data: {
      get: jest.fn()
    },
    request: {
      update: jest.fn()
    }
  };
}

// Mock app object for initialization
global.app = {
  initialized: jest.fn()
};

describe('Risk Assessment Form', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="riskAssessmentForm">
        <input type="radio" id="q1_low" name="q1" value="low" required>
        <input type="radio" id="q1_medium" name="q1" value="medium" required>
        <input type="radio" id="q1_high" name="q1" value="high" required>
        <input type="radio" id="q2_low" name="q2" value="low" required>
        <input type="radio" id="q2_medium" name="q2" value="medium" required>
        <input type="radio" id="q2_high" name="q2" value="high" required>
        <input type="radio" id="q3_yes" name="q3" value="yes" required>
        <input type="radio" id="q3_no" name="q3" value="no" required>
        <input type="radio" id="q4_yes" name="q4" value="yes" required>
        <input type="radio" id="q4_no" name="q4" value="no" required>
        <input type="radio" id="q5_yes" name="q5" value="yes" required>
        <input type="radio" id="q5_no" name="q5" value="no" required>
        <textarea id="q5NoReasonText" name="q5NoReasonText"></textarea>
        <div id="q5NoReason" style="display: none;"></div>
        <button type="submit">Submit</button>
      </form>
      <div id="notification" style="display: none;"></div>
      <div id="apptext"></div>
    `;
    global.client = {
      data: {
        get: jest.fn().mockResolvedValue({ ticket: { id: 123 } }),
      },
      request: {
        update: jest.fn().mockResolvedValue({}),
      },
    };
    // Mock console.error for error handling tests
    console.error = jest.fn();
    
    // Setup app functionality
    appModule.setupFormSubmission();
    appModule.setupQ5Change();
  });

  test('form submission updates ticket', async () => {
    // Check the radio buttons
    document.getElementById('q1_low').checked = true;
    document.getElementById('q2_low').checked = true;
    document.getElementById('q3_yes').checked = true;
    document.getElementById('q4_yes').checked = true;
    document.getElementById('q5_yes').checked = true;
    
    const form = document.getElementById('riskAssessmentForm');
    const submitEvent = new Event('submit');
    
    // Force promise resolution with await
    await Promise.resolve();
    form.dispatchEvent(submitEvent);
    await Promise.resolve();

    expect(client.data.get).toHaveBeenCalledWith('ticket');
    expect(client.request.update).toHaveBeenCalledWith('ticket', 123, {
      custom_fields: {
        'cf_risk_impact': 'low',
        'cf_risk_likelihood': 'low',
        'cf_rollback_plan': 'yes',
        'cf_tested_in_lower_env': 'yes',
        'cf_validation_possible': 'yes',
        'cf_validation_no_reason': '',
      },
    });
  });

  test('notification is shown on successful submission', async () => {
    // Check the radio buttons
    document.getElementById('q1_low').checked = true;
    document.getElementById('q2_low').checked = true;
    document.getElementById('q3_yes').checked = true;
    document.getElementById('q4_yes').checked = true;
    document.getElementById('q5_yes').checked = true;
    
    const form = document.getElementById('riskAssessmentForm');
    const submitEvent = new Event('submit');
    
    // Mock successful response and ensure promises are resolved
    client.request.update.mockResolvedValue({});
    
    // Submit the form
    form.dispatchEvent(submitEvent);
    
    // Wait for promises to resolve
    await Promise.resolve();
    await Promise.resolve();

    const notification = document.getElementById('notification');
    expect(notification.textContent).toBe('Risk assessment saved successfully!');
    expect(notification.style.display).toBe('block');
  });
  
  test('form submission with different values updates ticket correctly', async () => {
    // Check different radio buttons
    document.getElementById('q1_high').checked = true;
    document.getElementById('q2_medium').checked = true;
    document.getElementById('q3_no').checked = true;
    document.getElementById('q4_no').checked = true;
    document.getElementById('q5_no').checked = true;
    
    // Add text for q5 reason
    const reasonText = document.getElementById('q5NoReasonText');
    reasonText.value = 'Testing is not possible';
    
    const form = document.getElementById('riskAssessmentForm');
    const submitEvent = new Event('submit');
    
    form.dispatchEvent(submitEvent);
    await Promise.resolve();
    await Promise.resolve();

    expect(client.request.update).toHaveBeenCalledWith('ticket', 123, {
      custom_fields: {
        'cf_risk_impact': 'high',
        'cf_risk_likelihood': 'medium',
        'cf_rollback_plan': 'no',
        'cf_tested_in_lower_env': 'no',
        'cf_validation_possible': 'no',
        'cf_validation_no_reason': 'Testing is not possible',
      },
    });
  });
  
  test('handles error during client.data.get', async () => {
    // Setup error in data.get
    const error = new Error('Failed to get ticket');
    client.data.get.mockRejectedValue(error);
    
    const form = document.getElementById('riskAssessmentForm');
    document.getElementById('q1_low').checked = true;
    const submitEvent = new Event('submit');
    
    form.dispatchEvent(submitEvent);
    
    // Need to wait for the promises to resolve/reject
    await new Promise(process.nextTick);
    
    // Verify the error was handled
    expect(console.error).toHaveBeenCalledWith(
      'Error occurred. Details:',
      expect.any(Error)
    );
  });
  
  test('handles error during client.request.update', async () => {
    // Setup error in request.update
    const error = new Error('Failed to update ticket');
    client.request.update.mockRejectedValue(error);
    
    document.getElementById('q1_low').checked = true;
    document.getElementById('q2_low').checked = true;
    document.getElementById('q3_yes').checked = true;
    document.getElementById('q4_yes').checked = true;
    document.getElementById('q5_yes').checked = true;
    
    const form = document.getElementById('riskAssessmentForm');
    const submitEvent = new Event('submit');
    
    form.dispatchEvent(submitEvent);
    
    // Need to wait for the promises to resolve/reject
    await new Promise(process.nextTick);
    
    // Verify the error was handled
    expect(console.error).toHaveBeenCalledWith(
      'Error occurred. Details:',
      expect.any(Error)
    );
  });
  
  test('q5 change toggles q5NoReason display', () => {
    // We need to setup q5 element that matches what's in the app.js
    document.body.innerHTML = `
      <select id="q5">
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
      <div id="q5NoReason" style="display: none;"></div>
    `;
    
    // Set up the change handler
    appModule.setupQ5Change();
    
    // Get elements
    const q5 = document.getElementById('q5');
    const q5NoReason = document.getElementById('q5NoReason');
    
    // Change to "no" should show the reason div
    q5.value = 'no';
    q5.dispatchEvent(new Event('change'));
    expect(q5NoReason.style.display).toBe('block');
    
    // Change to "yes" should hide it
    q5.value = 'yes';
    q5.dispatchEvent(new Event('change'));
    expect(q5NoReason.style.display).toBe('none');
  });
  
  test('renderContactName displays requester name', async () => {
    const requesterData = { requester: { name: 'John Doe' } };
    client.data.get.mockResolvedValue(requesterData);
    
    appModule.renderContactName();
    
    await Promise.resolve();
    
    const textElement = document.getElementById('apptext');
    expect(textElement.innerHTML).toBe(`Data Method returned: ${requesterData.requester.name}`);
  });
});

describe('Utility Functions', () => {
  test('handleErr logs error messages', () => {
    // Mock console.error
    console.error = jest.fn();
    
    // Test with error object
    const error = new Error('Test error');
    appModule.handleErr(error);
    expect(console.error).toHaveBeenCalledWith('Error occurred. Details:', error);
    
    // Test with default value
    appModule.handleErr();
    expect(console.error).toHaveBeenCalledWith('Error occurred. Details:', 'None');
  });
  
  test('showNotification displays and hides notification', () => {
    // Setup DOM
    document.body.innerHTML = '<div id="notification" style="display: none;"></div>';
    jest.useFakeTimers();
    
    // Call the function
    appModule.showNotification('Test notification');
    
    // Check immediate state
    const notification = document.getElementById('notification');
    expect(notification.textContent).toBe('Test notification');
    expect(notification.style.display).toBe('block');
    
    // Check state after timeout
    jest.advanceTimersByTime(3000);
    expect(notification.style.display).toBe('none');
    
    jest.useRealTimers();
  });
});

describe('App Initialization', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  test('renderApp calls app.initialized and sets up client', async () => {
    // Mock document.readyState
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: function() { return 'interactive'; }
    });
    
    // Create a mock client
    const mockClient = setupMockClient();
    
    // Mock the app.initialized to return our mock client
    app.initialized.mockReturnValue(Promise.resolve(mockClient));
    
    // Mock window.client assignment
    Object.defineProperty(window, 'client', { 
      writable: true,
      value: undefined
    });
    
    // Call the onreadystatechange handler which should trigger renderApp
    document.onreadystatechange();
    
    // Wait for promises to resolve
    await Promise.resolve();
    
    // Verify app.initialized was called
    expect(app.initialized).toHaveBeenCalled();
    
    // Our mock should now be assigned to window.client
    expect(window.client).toBe(mockClient);
  });
  
  test('document onreadystatechange does nothing when not interactive', () => {
    // Mock document.readyState
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: function() { return 'loading'; }
    });
    
    // Reset app.initialized mock
    app.initialized.mockReset();
    
    // Trigger onreadystatechange
    document.onreadystatechange();
    
    // app.initialized should not be called
    expect(app.initialized).not.toHaveBeenCalled();
  });
  
  test('error in initialization is handled', async () => {
    // Mock document.readyState
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: function() { return 'interactive'; }
    });
    
    // Mock error in app.initialized
    const error = new Error('Init error');
    app.initialized.mockReturnValue(Promise.reject(error));
    
    // Mock console.error
    console.error = jest.fn();
    
    // Trigger onreadystatechange
    document.onreadystatechange();
    
    // Wait for promises to resolve
    await new Promise(process.nextTick);
    
    // Error should be logged
    expect(console.error).toHaveBeenCalledWith(
      'Error occurred. Details:',
      expect.any(Error)
    );
  });
});

describe('Edge Cases and Branch Coverage', () => {
  test('setupFormSubmission handles missing form element', () => {
    document.body.innerHTML = '';
    appModule.setupFormSubmission();
    // Should not throw any errors
    expect(true).toBe(true);
  });
  
  test('renderContactName handles missing text element', () => {
    document.body.innerHTML = '';
    appModule.renderContactName();
    // Should not throw any errors
    expect(true).toBe(true);
  });
  
  test('setupQ5Change handles missing q5 element', () => {
    document.body.innerHTML = '';
    appModule.setupQ5Change();
    // Should not throw any errors
    expect(true).toBe(true);
  });
  
  test('showNotification handles missing notification element', () => {
    document.body.innerHTML = '';
    appModule.showNotification('Test message');
    // Should not throw any errors
    expect(true).toBe(true);
  });
  
  test('setupQ5Change handles missing q5NoReason element', () => {
    document.body.innerHTML = '<select id="q5"></select>';
    appModule.setupQ5Change();
    
    // Simulate change
    const q5 = document.getElementById('q5');
    q5.value = 'no';
    q5.dispatchEvent(new Event('change'));
    
    // Should not throw any errors
    expect(true).toBe(true);
  });
}); 