# 2. Architecture Diagram

```ascii
                  +--------------------------------+
                  |       User's Browser (macOS)   |
                  |                                |
                  |    +-----------------------+   |
                  |    |   React SPA (Client)  |   |
                  |    |   (localhost:5173)    |   |
                  |    +-----------+-----------+   |
                  +----------------|---------------+
                                   |
                         (HTTP API Requests)
                         e.g., /api/tmdb/search
                                   |
                  +----------------V---------------+
                  |      CRUMBLE BFF Server        |
                  |   (Node.js/Express) (Private)  |
                  |      (localhost:3001)          |
                  +----------------+---------------+
                                   | (Manages secrets/keys)
         +-------------------------+-------------------------+
         |                         |                         |
(Calls w/ TMDB Key)     (Calls w/ Trakt Key)       (Queries Addons)
         |                         |                         |
+--------V--------+     +----------V---------+     +---------V----------+
| TMDB API        |     | Trakt.tv API       |     | Stremio Addon      |
| (api.themoviedb.org)|     | (api.trakt.tv)     |     | Ecosystem          |
+-----------------+     +--------------------+     +--------------------+