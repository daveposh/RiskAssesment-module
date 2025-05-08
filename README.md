# Freshservice Risk Assessment Questionnaire App

This Freshservice app adds a Risk Assessment Questionnaire to Change tickets, allowing users to assess the risk of changes before deployment.

## Features

- Risk assessment questionnaire with 5 key questions
- Saves responses as custom fields on the Change ticket
- Conditional logic for additional explanations

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/freshservice-risk-assessment.git
   cd freshservice-risk-assessment
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure the app**:
   - Update the `manifest.json` file with your Freshservice app details.
   - Ensure custom fields (`cf_risk_impact`, `cf_risk_likelihood`, `cf_rollback_plan`, `cf_tested_in_lower_env`, `cf_validation_possible`, `cf_validation_no_reason`) are created in your Freshservice instance.

4. **Build and deploy**:
   ```bash
   npm run build
   ```
   Upload the built app to your Freshservice instance.

## Usage

1. Open a Change ticket in Freshservice.
2. The Risk Assessment Questionnaire will appear in the ticket sidebar.
3. Fill out the questionnaire and submit.
4. Responses will be saved as custom fields on the ticket.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
