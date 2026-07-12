Plan: Improve animations and add a few focused features to T-Cash Tracker

1. Tactile micro-interactions
   - Replace the existing `tap-scale` class with a more pronounced press-down effect on all buttons and cards.
   - Add a quick scale-and-spring animation so taps feel like a real physical button.
   - Apply press feedback to the balance card, quick-action cards, bottom tab buttons, and sheet close buttons.

2. Animated balance number
   - When a user adds balance or deducts fare, the current balance label will count up/down smoothly instead of instantly jumping.
   - Use a lightweight, spring-based number animation with a short duration.
   - Also animate the "+Rs." / "−Rs." amount preview so the change is visible.

3. Staggered list entry animations
   - On the Home "Recent activity" list and the History grouped lists, newly rendered items will slide in with a short staggered fade/slide animation.
   - Apply only on initial render of the list, not on every re-render, to avoid visual noise.

4. Success / confirmation micro-reward
   - After adding balance or deducting fare, briefly show a small inline confirmation icon/flash on the relevant button (e.g., checkmark on the Add Balance card, bus icon on the Deduct card).
   - Keep it subtle and not a full confetti overlay so the app stays snappy.

5. New feature: swipe to delete a transaction
   - In History, allow users to swipe left on a transaction to reveal a delete button.
   - After deletion, show a toast notification with an "Undo" action to restore the transaction.
   - This keeps the transaction list clean without adding a separate edit mode.

6. New feature: clear low-balance warning
   - When the balance drops to or below the user-defined threshold, the balance card already turns red. We will add a short, non-blocking attention animation (gentle pulse) to the card so the warning is noticed immediately.

7. Optional: hidden fare presets / quick fare
   - Add an optional small fare shortcut chip on the home dashboard (e.g., Rs. 20 / Rs. 30 / Rs. 50) so frequent commuters can deduct in one tap instead of opening the red card. Leave the default red card as the main action.

Technical details
   - All changes will be contained in `src/components/tcash/TCashApp.tsx` and `src/styles.css` (for new animation keyframes/utility classes).
   - No backend, no new routes, no new dependencies required. Use pure CSS transitions and a small custom hook for the number animation.
   - Keep the existing green/red color scheme, PKR currency, and no-login/offline behavior exactly as today.

What will not change
   - Layout, colors, branding, navigation, currency, or offline storage.
   - The existing Add Balance and Deduct Rs. 30 flows remain the primary actions.

Out of scope
   - Confetti libraries, full-page transitions, or complex gesture libraries.
   - Backend, authentication, push notifications, or in-app purchases.
