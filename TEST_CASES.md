# Test Case Procedures

This document outlines manual test steps mirroring the project's specification. Each section lists reproduction steps and the expected outcome.

## Setup
1. Install dependencies.
   ```bash
   npm install
   ```
2. Start the development server.
   ```bash
   npm run dev
   ```
3. Open the application in a browser at the printed local URL.

## Reordering
1. Sign in and navigate to the certificate builder.
2. Drag an item to a new position.
3. Refresh the page.

**Expected:** The new order is preserved and no errors are shown.

## Validation
1. Open a form that requires input (e.g., creating a certificate).
2. Submit the form with required fields left blank.
3. Observe validation messages.
4. Fill in the required fields and resubmit.

**Expected:** Validation errors appear when fields are empty, and the form submits successfully after corrections.

## Publish
1. Create or edit a certificate until validation passes.
2. Click the **Publish** action.
3. Confirm the publish operation in any modal prompt.

**Expected:** A success message appears and the certificate is available to users.

## Preview
1. Choose an existing certificate and select **Preview**.
2. Ensure all content displays correctly.
3. Exit preview mode.

**Expected:** The preview reflects the current certificate state without requiring publication.

## Reordering After Publish
1. Reopen a published certificate.
2. Change the order of items as in the **Reordering** test.
3. Preview the certificate again.

**Expected:** Reordering is reflected in preview without republishing errors.

## Cleanup
1. Stop the development server with `Ctrl+C`.
2. Undo any temporary data changes if necessary.

