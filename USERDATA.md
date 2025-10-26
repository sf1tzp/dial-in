# User Data Considerations

> Note: This was taken directly from the README, and needs more consideration before implementation should begin

## User Data and Monetization

The app should be completely usable in PWA, local storage mode, without requiring any user data be sent upstream.

We aim to minimize the amount of personal data collected when the user opts in:
- email
- username
- their coffee records

IF offering payments, we will only authorize payments through apple or google pay, hopefully avoiding the need to retain additional information

## Authentication

By limiting our exposure to user data, we aim to provide a passwordless, email based authentication mechanism.

## Content moderation

We will utilize automated content moderation tools for all user uploaded strings and images.


## GDPR considerations
