# Software Architecture Document

- **Project:** CRUMBLE - Minimalist Media Aggregator
- **Status:** Prototype - V0.1
- **Author:** Lead Engineer
- **Date:** October 26, 2023

---

## 1. Overview

The CRUMBLE architecture is designed for security, scalability, and a modern user experience. It employs a **Single Page Application (SPA)** model for the frontend and a **Backend-for-Frontend (BFF)** for the backend. This separation of concerns is critical: the client is responsible *only* for presentation, while the BFF handles all business logic, data fetching, and secure management of API keys.

## 2. Architecture Diagram

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