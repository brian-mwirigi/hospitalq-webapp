# Contract Questions

QuickFundi (Team 12) sent their spec after we had already uploaded ours on eLearning. These questions are about their yaml.

## 1. POST /bookings — we were told we cant write anything

In week 2 they said we can read worker profiles (skills, rates, reviews) but we cannot create or edit stuff on their side. Their spec has POST /bookings, PATCH /bookings/{id} to reschedule, and DELETE /bookings/{id} to cancel.

Are we actually allowed to book a fundi for hospital maintenance or is that leftover from another team? requestedBy is just a string like "HospitalQ Facilities Desk". Is that enough or do they want a real account id?

## 2. No auth on any route

GET /workers, GET /workers/{id}, and all the booking routes have no token. Anyone who has the url can search people and cancel booking bk_5021.

They said passwords and suspension status are off limits, which is fine, but how do we call this without some key? If a booking DELETE returns 409 BOOKING_NOT_CANCELLABLE when its already completed, what about if we never had permission in the first place? There is no 401 in the whole file.

## 3. GET /workers — jobType and location are kinda tight

jobType is required and the enum is only electrician, plumber, handyman. What if we need a carpenter or painter for the hospital? Do we just not use their API then?

location is a free string, example "Nairobi, Upper Hill". Do we have to match that exact text or is it a search? Also ratePerHour is 800 with no currency, and the profile has no skills list even though they said skills were fair game. experienceYears is there but skills is not.
