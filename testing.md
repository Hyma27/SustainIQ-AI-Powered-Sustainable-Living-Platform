# SustainIQ: Quality Assurance & Testing Manual

This document provides a comprehensive Quality Assurance (QA) checklist and manual test cases to verify the functionality, security, input validation, and accessibility of **SustainIQ: AI-Powered Sustainable Living Platform**.

---

## 1. QA Checklist

Use this checklist before every release or deployment to confirm that all features and views operate cleanly.

### Carbon Footprint Calculator
- [ ] **Data Persistence:** Verify that calculated inputs and total CO2 values persist in `localStorage` across page reloads.
- [ ] **Real-Time Recalculations:** Verify that changing any input slider, select dropdown, or text field dynamically updates the live CO2 indicator and the donut chart.
- [ ] **Steppers Navigation:** Verify that step transitions (steps 1–4) work correctly and hide/show navigation buttons appropriately.
- [ ] **Bounds Enforcement:** Confirm that typing negative values or empty spaces does not crash the app, and values are sanitized to their minimum acceptable bounds on focus out.

### Green Impact Simulator
- [ ] **State Toggles:** Verify that clicking/toggling simulator actions immediately adds or subtracts their values from the simulated impact.
- [ ] **Metrics Synchrony:** Verify that annual CO2 reduction, trees equivalent saved, and simulated score are updated live.
- [ ] **Comparison Chart:** Verify that the bar chart accurately reflects the comparison between "Current Lifestyle" and "Simulated Lifestyle".

### AI Sustainability Assistant (Chatbot)
- [ ] **Response Speed:** Verify that typing a prompt displays the typing indicator and generates a contextual sustainability response within 2 seconds.
- [ ] **Predefined Prompt Triggers:** Verify that clicking recommendation chips autofills the text box and triggers the query automatically.
- [ ] **Chat History:** Verify that messages scroll dynamically and persist during active navigation across views.

### Eco Challenges
- [ ] **Progress Updates:** Verify that clicking "Accept Challenge" changes status to "In Progress" and updates user challenges list.
- [ ] **Completion Logic:** Verify that completing challenges awards Eco Points and displays the achievement modal with micro-animations.

### Reports & Analytics
- [ ] **Chart Rendering:** Verify that the historical emissions line chart and weekly category bar chart load without error.
- [ ] **Print/Export functionality:** Verify that the print report function works (triggers browser print dialog) without styling glitches.

### Navigation & Accessibility
- [ ] **Focus Rings:** Verify that using the `Tab` and `Shift+Tab` keys displays a clear, solid outline offset around active elements (focus-visible).
- [ ] **ARIA Attributes:** Verify that screen-reader tags (`aria-label`, `alt` descriptors, `aria-hidden`) exist on all non-text headers, buttons, and decorative icons.
- [ ] **Contrast Verification:** Ensure background and text colors conform to WCAG 2.1 AA requirements (ratio > 4.5:1).

---

## 2. Manual Test Cases

### Test Case 1: Calculator Boundary Sanitization
* **Objective:** Verify that negative inputs, non-numeric values, or field overflows are sanitized gracefully.
* **Prerequisites:** Navigate to the Carbon Calculator tab.
* **Test Steps:**
  1. Go to step 1 (Transportation). In the "Car Distance" field, type `-250` and click outside the text box or press Enter.
  2. In the "Flight Hours" field, type `abc` and tab out.
  3. Go to step 2 (Energy). Move the "Renewable Energy Share" slider to 100%, then try to type `120` in the input field manually (if editable) or modify the field through console to evaluate handler.
  4. Click "Calculate Details" on Step 4 and save the assessment.
* **Expected Outcome:** 
  - The "Car Distance" field automatically corrects to `0` upon tabbing out.
  - The "Flight Hours" field is treated as `0` in calculations and resets appropriately.
  - The "Renewable Energy Share" does not exceed 100%.
  - The final calculated carbon footprint is a positive number and does not report `NaN`.

---

### Test Case 2: Goal Creation & String Constraints
* **Objective:** Ensure goals cannot be created with empty descriptions or invalid targets, and overly long descriptions are truncated gracefully.
* **Prerequisites:** Navigate to the Dashboard or Goals panel.
* **Test Steps:**
  1. Locate the "Set a New Goal" card. Leave the "Goal Description" empty and click "Create Goal".
  2. Type a very long goal description: `Reduce daily household single-use plastics and walk 10 kilometers to the local organic food market every Saturday morning` (118 characters). Keep the target at `50`. Click "Create Goal".
  3. Try to create a goal with a target value of `-10`. Click "Create Goal".
* **Expected Outcome:**
  - Step 1: Shows alert modal `"Please specify a goal description."` and does not create an empty card.
  - Step 2: The goal card is created successfully, but the description text in the list is truncated to `Reduce daily household single-use pl...` (maximum 40 characters) to prevent card overflow.
  - Step 3: Shows alert `"Please set a valid target number greater than 0."` and cancels creation.

---

### Test Case 3: Keyboard Navigation & Focus Ring Indicators
* **Objective:** Verify that the application is fully navigable using only the keyboard.
* **Prerequisites:** Load the SustainIQ app and press `Tab` key.
* **Test Steps:**
  1. Press `Tab` repeatedly to cycle through the sidebar links.
  2. Confirm that a bright green focus border (`2px solid #10b981`) appears around each menu option as it is selected.
  3. Focus on a button (e.g., "AI Chatbot" chip) and press `Enter`.
  4. Press `Tab` to navigate inside form fields and confirm all select/input boxes receive the same outline ring.
* **Expected Outcome:**
  - Every interactive control can be reached via `Tab`.
  - The active element has a clear, visible focus indicator with `3px` offset.
  - No focus indicator is visible when clicking buttons with a mouse (focus-visible only).

---

### Test Case 4: Theme Toggle and Accessibility Contrast
* **Objective:** Confirm contrast ratios are readable when switching between light and dark modes.
* **Prerequisites:** Open the Settings tab.
* **Test Steps:**
  1. Locate the Theme Toggle control.
  2. Toggle between Light Mode and Dark Mode.
  3. Inspect secondary text labels (e.g. subtext details, chart legends) on both modes.
* **Expected Outcome:**
  - Dark Mode: `--text-secondary` is `#cbd5e1`, giving a high contrast ratio against the dark backgrounds.
  - Light Mode: `--text-secondary` is `#334155`, maintaining high readability against the slate-white background panels.
  - Elements transition smoothly without layout shifts.
