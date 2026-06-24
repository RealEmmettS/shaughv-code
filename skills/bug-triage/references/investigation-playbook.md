# Investigation Playbook

Detailed guidance for using available tools during bug investigation. Choose your
approach based on what type of issue you're investigating.

---

## Tool Reference

### Browser Tools (Claude in Chrome)

Use these when the bug involves a web-based internal tool — UI issues, broken workflows,
display problems, form errors, or anything the end-user sees in a browser.

**Reproducing the bug:**
1. Use `navigate` to go to the affected URL
2. Use `read_page` to understand the current page structure and state
3. Use `find` to locate specific elements the bug report mentions
4. Use `computer` (click/type) to walk through the exact steps the user described
5. Use `read_console_messages` to check for JavaScript errors — this is often the
   fastest way to find the smoking gun
6. Use `read_network_requests` to check for failed API calls (look for 4xx/5xx responses,
   timeouts, or unexpected response data)

**Common investigation patterns:**

| Symptom | First Thing to Check |
|---------|---------------------|
| Page won't load / blank screen | Console errors, network failures, check if URL is correct |
| Data not showing up | Network requests (is the API returning data?), console errors, check data source |
| Wrong data displayed | Query the data platform directly to compare, check filters/parameters in network requests |
| Button/action doesn't work | Console errors on click, check if element is actually interactive via read_page |
| Form submission fails | Network request for the submit action, console errors, check validation |
| Slow performance | Network request timing, look for large payloads or many sequential requests |
| Display/layout broken | Read_page to check element structure, resize_window to test responsiveness |
| Permissions error | Check if the issue is role-specific, compare what different user views show |

**Capturing evidence:**
- After reproducing an error, immediately capture: the console output, the network
  request that failed, and the page state. These are your primary evidence.
- Use `get_page_text` to capture the visible content for your report.
- If the page state matters, describe what you see from read_page output.

### Data Platform / Backing Data Store

Use these when the bug might involve incorrect data, missing records, or data
integrity issues. Load the relevant data-platform tools via `tool_search`.

**Investigation approach:**
1. First, inspect the schema (the tables / collections / entities and their fields)
   to understand what data is available.
2. Query the specific records the bug report references. Compare what the data shows
   vs. what the UI shows vs. what the user expected.
3. If the issue involves data processing or workflows, run any available diagnostic
   queries or data-validation routines.

**Common data investigation patterns:**

| Symptom | What to Query |
|---------|--------------|
| Missing records | Query the entity with filters matching the user's criteria — are records actually missing, or is it a filter/display issue? |
| Wrong values displayed | Pull the raw record and compare field values to what the UI shows |
| Duplicate entries | Query with identifying fields to check for duplicates |
| Stale data | Check timestamps on records — is data updating as expected? |
| Calculation errors | Pull the input values and verify the expected calculation manually |

### Web Fetch

Use when you need to check external documentation, API docs, or known issue pages
for third-party services that internal tools depend on.

---

## Investigation Strategies by Bug Type

### UI / Display Bugs
1. Navigate to the page
2. Read the page structure
3. Check console for rendering errors
4. Try different viewport sizes if it might be responsive
5. Check if CSS or JS resources failed to load (network requests)

### Data Bugs
1. Reproduce in the UI to confirm the symptom
2. Query the data platform directly for the same records
3. Compare: Does the raw data match what the UI shows?
   - If data is correct but UI is wrong → frontend bug
   - If data is wrong → data pipeline or backend bug
4. Check if the issue affects all records or specific ones

### Workflow / Process Bugs
1. Walk through the workflow step by step in the browser
2. At each step, check console and network for errors
3. Identify exactly which step breaks
4. Check if the issue is with the current step's logic or if a previous
   step left the system in a bad state

### Intermittent Bugs
These are the hardest to investigate. Your approach:
1. Try to reproduce multiple times with the same inputs
2. If it only happens sometimes, look for:
   - Race conditions (things loading in different orders)
   - Caching (stale data from browser or API cache)
   - Timing (time-of-day, batch job schedules)
   - Data-dependent triggers (works for some records, not others)
3. Document your reproduction rate: "Reproduced 2 out of 5 attempts"

### Performance Bugs
1. Navigate to the slow page/action
2. Check network requests for slow responses (look at timing)
3. Check for excessive requests (are we making 100 API calls when we should make 1?)
4. Check console for warnings about performance
5. Note specific timing: "Page took ~8 seconds to load" or "API call took 12 seconds"

---

## Narrowing Down: The Divide-and-Conquer Approach

When the root cause isn't obvious, systematically narrow the search:

```
Is the problem in the data or the display?
├── Data is correct → Frontend issue
│   ├── JS errors in console? → Logic bug in frontend code
│   ├── CSS/layout broken? → Styling issue
│   └── No errors, wrong behavior? → State management or business logic bug
└── Data is incorrect → Backend/data issue
    ├── Data was never correct → Input/creation bug
    ├── Data was correct, now wrong → Processing/update bug
    └── Data is missing → Deletion bug or failed write
```

---

## Evidence Documentation Standards

As you investigate, keep running notes that will feed directly into the bug report.
For each finding, record:

- **What you did:** The specific action or query
- **What you observed:** The actual result, including error messages verbatim
- **What it means:** Your interpretation and how it affects your hypothesis
- **Evidence reference:** Console error text, network response status, data record IDs

Don't wait until the end to document — capture evidence as you go. It's much harder
to reconstruct an investigation after the fact.
