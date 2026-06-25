Check my email from the last 24 hours. Do the following in one go:

1. Search inbox for emails newer than 1 day: `newer_than:1d in:inbox`
2. Search archive for emails newer than 1 day: `newer_than:1d in:archive`

Run both searches in parallel, then present a combined summary organized as follows:

- Start with a count: how many threads in inbox, how many in archive
- Group by topic/theme (e.g. Legal/Deals, Calendar/Admin, HR, Personal, Notifications)
- For each email show: sender, subject, time received, and a one-line summary of what it's about
- Flag anything that looks like it needs a response or action from me
