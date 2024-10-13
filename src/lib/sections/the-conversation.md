# The Conversation

"Endpoint ‘x’ is missing property ‘y’." The API team jumps in, adds the fix, and leaves you waiting for deployment. "Try again," they say, and finally, it works. But now, you need to sort records by title instead of creation date. Another fix, more waiting. "It’s done." Except it isn’t because the code doesn’t account for spaces. Back to square one. "I’m on it," they tell you, and you’re stuck in the same loop: try again, wait, test, repeat.

A proper set of unit and integration tests could’ve caught many of these issues, but they’re often too costly—whether due to management priorities, mindset, or skills. From my experience, most teams treat integration tests as an afterthought, used mainly to prevent regressions rather than to catch issues upfront.

### What’s next

1. Monitoring.
2. Logs management.
3. Docker compose, Volumes?
