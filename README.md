# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/80d6581b-9dad-4660-9914-f0628d1d763c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/80d6581b-9dad-4660-9914-f0628d1d763c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/80d6581b-9dad-4660-9914-f0628d1d763c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Questions Bulk Import API

`POST /api/questions/bulk-import` supports importing questions in either JSON or CSV format.

### JSON

Send `Content-Type: application/json` with an `assessmentId` and either an `items` array or a `csv` string:

```json
{
  "assessmentId": 1,
  "items": [
    {
      "type": "MCQ",
      "body": "Question text",
      "choices": ["a", "b", "c", "d"],
      "correctIndex": 0,
      "explanation": "Optional explanation"
    }
  ]
}
```

Alternatively, supply the questions as a CSV string:

```json
{
  "assessmentId": 1,
  "csv": "type,body,choices,correctIndex,correctBool,explanation,tags\nMCQ,What is 2+2?,\"1|2|3|4\",3,,Example explanation,math"
}
```

### CSV

Send `Content-Type: text/csv` and provide the assessment id as a query parameter:

```
POST /api/questions/bulk-import?assessmentId=1
type,body,choices,correctIndex,correctBool,explanation,tags
MCQ,What is 2+2?,"1|2|3|4",3,,Example explanation,math
```

`choices` values should be separated by `|`.

## Kiosk Course API

`GET /api/kiosk/course/:courseId` returns blocks for a published course. The `courseId` parameter must be a valid number; non-numeric values result in a `400 Invalid courseId` response.
