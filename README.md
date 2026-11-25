# Kazang Tickets - Spaza Ticket Box Office

A clickable prototype of **Tickets as a VAS product on the Kazang terminal** (Product #101). A spaza owner sells an event ticket the same way they sell airtime: tap, search, take cash, print. The till slip is the ticket, and the buyer needs no app.

**Live demo:** https://YOURUSERNAME.github.io/kazang-tickets/

> This is a front-end prototype for the analysis phase. It shows the merchant, promoter and settlement flows. It is not connected to the Kazang POS, a payment switch or a real database.

## 60-second demo script

1. **Open the live link** on a phone or laptop. You land on the Kazang Pulse home screen.
2. Tap **Events & Tickets** (yellow border, NEW badge, next to Bus Tickets).
3. Search **Soweto** and tap **Soweto Amapiano Fest**.
4. Set the quantity to **2**. The screen shows Total **R300** and Your Commission (4%) **R12**.
5. Tap **Hold Tickets (5:00)**. The countdown starts and the tickets are reserved.
6. Enter **Cash Tendered: 350**. Change shows **R50**.
7. Tap **Confirm & Print**. The till slip appears with **2 QR codes**.
8. Tap **Print Slip**. After printing, the green **Transaction successful** banner appears.
9. Tap **Promoter** (top bar), create an event and publish it. Go back to **Events & Tickets** and the new event is already in the list.
10. Tap **Admin** (top bar). The sales table shows the sale, and Settlement shows Total R300, Promoter (85%) R255, Merchant Commission R12 and Lesaka R33.
11. Tap **Reset Demo** to clear everything for the next meeting.

## Other things to try

- **Language switcher** (top right): EN, ZU and ST switch key words between English, isiZulu and Sesotho.
- **Favourites tab:** tap the star on any tile to pin it, then open the Favourites tab.
- **Users tab:** cashier PIN screen for terminal KAZ-001. The demo PIN is **1234**.
- **Store > Cash-up:** shows today's sales, ticket sales and commission. The non-ticket figure is a made-up demo number.
- **Payments and other Sell tiles** are visual only and show "Demo - not connected to payment switch".

## Resetting the demo

Click **Admin > Reset Demo**. This clears LocalStorage and reloads the 3 seed events:

| Event | Date | Venue | Price | Tickets |
| --- | --- | --- | --- | --- |
| Soweto Amapiano Fest | 2026-12-14 | Soweto Theatre | R150 | 200 |
| Gospel Explosion | 2026-12-20 | Orlando Stadium | R100 | 300 |
| Tembisa Comedy Night | 2026-12-18 | Tembisa Hall | R80 | 150 |

Do this just before every presentation so the sales table starts empty.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The screens: home, tickets, select and pay, till slip, cash-up, promoter, admin |
| `style.css` | Kazang Pulse look, large touch targets and print rules (only the till slip prints) |
| `app.js` | All the logic: LocalStorage, language, navigation, hold, sale, QR codes, settlement |

No framework, no build step, no backend.

## Run it locally

1. Download or clone the repo.
2. Open the folder in VS Code and right-click `index.html`, then **Open with Live Server**. Or just double-click `index.html`.

## Publish on GitHub Pages

1. Push the three files to a public repo named `kazang-tickets`.
2. On GitHub go to **Settings > Pages**.
3. Under Source choose **Deploy from a branch**, then **main** and **/ (root)**, then **Save**.
4. After a minute the site is live at `https://YOURUSERNAME.github.io/kazang-tickets/`. Put that link at the top of this README.

## Business rules used in the demo

These are the pilot rules from the requirements document. Finance still has to confirm them.

- **Hold:** 5 minutes. When it expires the tickets are released.
- **Merchant commission:** 4% of the sale (illustrative).
- **Settlement split:** Promoter 85%, merchant commission, and Lesaka gets the remainder.
- **Duplicate sales:** one hold can only become one sale.
- **General Admission only:** no allocated seating.
- **QR format:** `LSK-2026-XXXXXX`, one code per ticket.

## Known limits of the prototype

- **Data is per browser.** Events and sales are saved in LocalStorage on one device. They are not shared across phones or terminals.
- **Holds only reserve tickets on the same device.** Two terminals could sell the same last ticket.
- **QR codes are not validated.** Nothing records a code as used, so single-use gate scanning is Phase 2.
- **QR images need internet.** They load from api.qrserver.com.
- **The PIN and settlement run in the browser.** There is no real security or audit trail.

## What the pilot version needs

- Kazang POS API integration for search, hold, confirm, void and reprint, with an idempotency key per sale
- A shared ticketing backend that the POS, promoter portal and admin all read from
- Daily reconciliation: POS total = ticketing total = cash collected
- Fraud alerts, a void and refund audit log, and gate validation
- Finance sign-off on commission, settlement timing and refunds

*Lesaka Technologies | Merchant Division | Analysis Phase v1.0 | Prepared by the Product Lead, Ticketing VAS*
