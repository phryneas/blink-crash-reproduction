

reproduction of a Chromium renderer crash:
```
  FATAL third_party/blink/renderer/core/dom/document.cc
  Check failed: Lifecycle().StateAllowsTreeMutations().

Symbolized crash stack (Chrome 150 ASAN):
  BeginMainFrame -> ...RunPaintLifecyclePhase -> PaintTree
    -> BoxFragmentPainter::PaintCaretsIfNeeded
      -> FrameCaret::PaintCaret -> FrameSelection::SelectionHasFocus()
        -> Document::UpdateStyleAndLayout()   // style/layout DURING paint
          -> CHECK(StateAllowsTreeMutations())  // illegal -> renderer abort
```

Ingredients:
 1. A focused <input> so Blink paints a caret every frame.
 2. virtua's `Virtualizer` inside a scrollable container, measuring each row
    with its internal item ResizeObserver.
 3. Variable, changing row heights + scroll nudging, so virtua keeps
    dispatching ITEM_RESIZE -> flushSync (synchronous commit) + fixScrollJump
    from inside the ResizeObserver callback, leaving layout dirty across the
    RO-delivery boundary ("ResizeObserver loop completed with undelivered
    notifications"). The next scheduled paint then repaints the focused caret
    with dirty layout -> forces layout mid-paint -> the CHECK fires.


# Running

Just do 
```
npm install
npm run test
```
Output will look like

```
====================================================================================================

  (Run Starting)

  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Cypress:        14.5.4                                                                         │
  │ Browser:        Electron 130 (headless)                                                        │
  │ Node Version:   v24.16.0 (/Users/tronic/.local/share/mise/installs/node/24.16.0/bin/node)      │
  │                                                                                                │
  │ Specs:          1 found (repro.cy.ts)                                                          │
  │ Searched:       cypress/e2e/**/*.cy.{js,jsx,ts,tsx}                                            │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘


────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                                                    
  Running:  repro.cy.ts                                                                     (1 of 1)
Warning: The following browser launch options were provided but are not supported by electron


  blink renderer crash repro
    1) iteration 0: focused caret + virtua resize churn

We detected that the Electron Renderer process just crashed.

We have failed the current spec but will continue running the next spec.

This can happen for a number of different reasons.

If you're running lots of tests on a memory intense application.
  - Try increasing the CPU/memory on the machine you're running on.
  - Try enabling experimentalMemoryManagement in your config file.
  - Try lowering numTestsKeptInMemory in your config file during 'cypress open'.

You can learn more here:

https://on.cypress.io/renderer-process-crashed

  (Results)

  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Tests:        8                                                                                │
  │ Passing:      0                                                                                │
  │ Failing:      1                                                                                │
  │ Pending:      0                                                                                │
  │ Skipped:      7                                                                                │
  │ Screenshots:  1                                                                                │
  │ Video:        false                                                                            │
  │ Duration:     1 second                                                                         │
  │ Spec Ran:     repro.cy.ts                                                                      │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘
```
