/*
 * Reports Page — Guided React Exercise
 *
 * Goal:
 * Build a page where a user selects a month and sees that month's income,
 * expenses, net savings, expense categories, and a six-month trend.
 *
 * Learning goal:
 * Use this page to practise React's core data flow:
 * state describes the UI, effects synchronize it with an API, and props pass
 * data into smaller presentation components.
 *
 * Work through the TODOs in order. Keep the first version simple: render text
 * and lists before adding cards or charts. A plain version that handles data
 * correctly is a better checkpoint than a polished version with hidden bugs.
 */

// TODO 1 — Choose the imports
// Which React hooks are needed for values that change and work that should run
// after rendering? Find the configured Axios instance used by the other pages
// instead of importing Axios directly. You will also eventually import the
// shared month picker and any presentation components you extract.

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from '../api/axios';

// TODO 2 — Create local-date helpers
// Create a helper that returns the current local month in YYYY-MM format.
// Why could converting the current time to UTC select the wrong month near a
// month boundary?

function formatMonth(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getCurrentMonth() {
  return formatMonth(new Date());
}

function getTrendStartMonth(selectedMonth, priorMonths = 5) {
  const [year, month] = selectedMonth.split('-').map(Number);
  const date = new Date(year, month - 1 - priorMonths, 1);
  return formatMonth(date);
}

// Create another helper that takes a selected YYYY-MM month and returns the
// month five months earlier. The reports API treats both ends of the trend
// range as inclusive, so those two values produce six monthly data points.
//
// These are derived values, not independent user choices. Keep them outside
// component state so they cannot drift out of sync with the selected month.

// TODO 3 — Normalize API data
// PostgreSQL aggregate values arrive as strings, even when they represent
// money or percentages. Create small normalization helpers that convert:
// - summary totals, changes, and non-null percentages into numbers;
// - each category total into a number;
// - each trend's income, expenses, and net savings into numbers.
//
// Preserve null comparison percentages. Null means there was no valid
// previous-month baseline; it is different from a zero-percent change.
//
// Why should normalization happen once after fetching instead of repeatedly
// inside every card, list, or chart?



// TODO 4 — Define the Reports component and its state
// Start the selected month with the local-current-month helper.
//
// Identify the values that can change over the component's lifetime:
// - the selected month;
// - the summary object;
// - the category breakdown;
// - the six-month trend;
// - whether data is loading;
// - an error message, if loading fails.
//
// Which initial value makes sense for each one? Notice that the trend start
// month can always be calculated from the selected month and needs no state.

function Reports() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth)
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

// TODO 5 — Load the reports
// Inside the component, create one async operation that loads a complete,
// internally consistent report:
// - GET /reports/summary with the selected month;
// - GET /reports/categories with the selected month;
// - GET /reports/trends from five months earlier through the selected month.
//
// Start loading and clear the previous error before sending requests. Fetch
// all three resources together because no request depends on another.
//
// Only replace the displayed report after all three requests succeed. Run the
// normalization helpers before storing the responses in state.
//
// If a request fails, keep technical details in the console but store a short,
// user-visible message in error state. Always finish the loading state.

  async function fetchReports() {
    setIsLoading(true);
    setError(null);

    try {
      const trendStartMonth = getTrendStartMonth(selectedMonth);
      const [summaryResponse, categoriesResponse, trendsResponse] = await Promise.all([
        axios.get('/reports/summary', {
          params: { month: selectedMonth },
        }),
        axios.get('/reports/categories', {
          params: { month: selectedMonth },
        }),
        axios.get('/reports/trends', {
          params: {
            from: trendStartMonth,
            to: selectedMonth,
          },
        }),
      ]);

      // TODO 3: Normalize each response before storing it in state.
      setSummary(summaryResponse.data);
      setCategoryBreakdown(categoriesResponse.data);
      setTrends(trendsResponse.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Unable to load reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

// TODO 6 — Synchronize the page with the selected month
// Use an effect to load the report when the page first appears and whenever
// the selected month changes.
//
// What belongs in the dependency list? Explain in your own words why changing
// that value should rerun the effect.
//
// Add request cancellation in the effect cleanup. If a user changes months
// quickly, an older, slower response must not overwrite the newest report.
// A canceled request is expected cleanup and should not become a visible error.

// TODO 7 — Add the controlled month picker
// Render a page heading followed by the shared month picker.
//
// Reports owns the selected-month state. Pass the current value down and
// receive changes through a callback. This is a controlled input and an
// example of React's one-way data flow: data goes down; events come back up.

// TODO 8 — Render each request state deliberately
// Decide what the page should show while loading, when loading fails, and when
// loading succeeds. Include a retry action in the error state.
//
// Avoid treating an empty category array as an error. It means the user has no
// expense transactions for that month and should receive a useful empty-state
// explanation.

// TODO 9 — Render correct information before adding charts
// First render the normalized values as plain text and simple lists:
// - income, expenses, and net savings;
// - each total's month-over-month amount and percentage change;
// - expense categories ordered as returned by the server;
// - six monthly income, expense, and net-savings values.
//
// Display a clear fallback such as "No previous-month baseline" when a change
// percentage is null. Keep zero-value trend months because a missing month and
// a month with no activity should not look the same.
//
// Verify the data flow in React DevTools and the browser network panel before
// introducing visual components.

// TODO 10 — Extract presentation components after the page works
// Look for UI sections that are self-contained or repeated. Good candidates
// are summary cards, a category breakdown, and a trend chart.
//
// Keep selected-month state and API loading in Reports. Pass normalized data
// to presentation components through props. Those components should describe
// how data looks, not fetch their own copies.
//
// Once the text version is tested, replace the category and trend lists with
// Recharts visualizations without changing the page's data flow.

// TODO 11 — Protect and export the completed page
// Follow the existing Dashboard behavior for unauthenticated users, then
// export Reports as the page's default component.
//
// After this file contains a working component, add its route and logged-in
// navigation entry. Do not wire an unfinished module into App.js.
  return <div />
}

export default Reports;

/*
 * Learning checkpoints
 *
 * Before considering the first version complete, make sure you can explain:
 * - why each state value belongs in state;
 * - when the effect runs and what causes it to run again;
 * - how the month picker's value and change event move through the component;
 * - why API numeric strings are normalized before rendering;
 * - how loading, error, empty, and successful states differ;
 * - why extracted presentation components receive props instead of fetching.
 *
 * Suggested test cases:
 * - the page starts on the current local month;
 * - all endpoints receive the correct month parameters;
 * - selecting another month reloads all report sections;
 * - numeric strings become numbers before reaching presentation components;
 * - null comparison percentages show a meaningful fallback;
 * - an empty category response shows an empty state;
 * - a failed request shows an error and retry action;
 * - a stale request cannot replace data for the latest selected month.
 */
