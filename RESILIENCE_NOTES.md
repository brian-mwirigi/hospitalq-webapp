# Resilience notes

Week 11. The feature is Admin → QuickFundi. The browser asks our server. Our server calls Team 12 at `PARTNER_URL` (`https://team12-webapp-production.up.railway.app`). The stand-in in `flaky-partner.js` was only for the slow, flaky, and always-error drills. `PARTNER_URL` is pointed back at Team 12.

## What we tested

| Failure | What the user saw | What the log said |
|---|---|---|
| Partner stopped (`http://127.0.0.1:59999`, nothing listening). No saved list yet. | "QuickFundi is unavailable right now." The rest of the API still answered. | `partner call failed: ECONNREFUSED` after two retries (`200 ms`, then `400 ms`). |
| Partner stopped, after one good search. | The same worker table, with a yellow banner: saved data from that time, QuickFundi is not responding. | `partner call failed: timeout` when the stand-in accepted the connection and never answered. `ECONNREFUSED` when nothing was listening. |
| Slow. Stand-in waits 10 seconds before answering. | Before the timeout, a raw call sat for 10.015 seconds. After it, the call is cut off. If a list was already loaded, the banner shows that saved list. If not, the unavailable message. | Raw call: 10.015 seconds, then 200. With the timeout and no retry: `TimeoutError` at 2.008 seconds. |
| Flaky. Stand-in returns 503 twice, then 200. | The worker list. No error. The two failures stay in the terminal. | `attempt 1 failed, retrying in 200 ms` and `attempt 2 failed, retrying in 400 ms`, then 200 in 0.651 seconds. |
| Always 500. | Unavailable message, or the saved banner if a list was already loaded. It stopped. It did not keep retrying. | Two retry lines, then `partner returned 500`. Elapsed 0.644 seconds. |

A normal stand-in call in ok mode took 0.055 seconds.

## Numbers, and why

Live Team 12 searches for plumbers in Nairobi took 1.348, 1.006, 1.120, and 0.489 seconds. A 1500 ms timeout would have cut off the first of those, which was a normal answer, so the timeout is **2000 ms**.

Retries: **2**. Delay: **200 ms**, then **400 ms**. Writes are not retried. 400, 401, 403, and 404 are not retried.

Worst case: `(2 + 1) x 2000 + 200 + 400 = 6600 ms`. That is the admin search, not the waiting-room board. Six and a half seconds is the ceiling before we show saved data or the unavailable line. A normal search is about half a second to a bit over one second, so the page does not pay that cost unless Team 12 is actually failing.

## What a user would feel without this

On the Admin page, QuickFundi is the table of plumbers, electricians, and handymen. Without a timeout, a slow Team 12 holds that table on "Loading..." for as long as they take. We watched the stand-in do that for 10 seconds, and a person booking maintenance would have left the page. Without retries, the flaky 503 shows as a failure even though the next call would have worked, so they search again and may book nobody. Without the saved list, a later outage wipes the names they were just looking at, and they cannot read the rate or the location to call someone. The banner is what stops that saved table from looking like a live answer.

## What we did not build

A circuit breaker would stop calling Team 12 after a stretch of failures and try them only now and then. This code still tries every search three times.
