
# EMI Calculator React App

This is a static React.js EMI Calculator for Home Loan, Personal Loan, and Car Loan, inspired by the provided screenshots.

## Features
- Tabs for Home Loan, Personal Loan, Car Loan
- Sliders and input fields for Loan Amount, Interest Rate, and Loan Tenure
- EMI calculation logic (monthly EMI, total interest, total payment)
- Pie chart for payment breakup (principal vs interest)
- Year-wise amortization schedule with principal, interest, total payment, balance, and loan paid to date
- Responsive, modern UI
- No backend, all logic in React

## How to Run Locally
```bash
npm install
npm run dev
```

## How to Deploy to GitHub Pages
1. Build the static site:
	```bash
	npm run build
	```
2. Copy the contents of the `dist` folder to your `gh-pages` branch or use a deployment tool like `gh-pages` npm package.
3. Ensure your repository settings point to the correct branch/folder for GitHub Pages.

## Tech Stack
- React
- Vite
- Material UI (MUI)
- Chart.js & react-chartjs-2

## Customization
- Update `vite.config.js` base path if deploying to a subfolder.
- All logic/UI is in `src/App.jsx`.

---
MIT License
