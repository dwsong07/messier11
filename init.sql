CREATE TABLE rss_sub(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    requester_id TEXT NOT NULL
);