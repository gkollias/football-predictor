# Greek Super League 2025-26 Predictor

A React-based web app for tracking, predicting, and analyzing the Greek Super League 2025-26 season. Features real match data, goalscorer information, and interactive prediction tools.

![Status](https://img.shields.io/badge/season-2025--26-blue) ![Matchday](https://img.shields.io/badge/matchday-24%2F26-green) ![Goals](https://img.shields.io/badge/real%20goals-371-orange)

## Quick Start

The app is a single React JSX file designed to run as a [Claude Artifact](https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them) or in any React environment.

```bash
# To run locally with Vite:
npm create vite@latest sl-predictor -- --template react
cp greek-super-league-predictor.jsx sl-predictor/src/App.jsx
cd sl-predictor && npm install && npm run dev
```

## League Format

The Greek Super League 2025-26 has a unique split-season format:

### Regular Season (MD 1–26)
- **14 teams**, double round-robin (26 matchdays)
- Currently at **MD 24** (168/182 matches played)

### Post-Season (starts April 4, 2026)
After MD 26, the table splits into three groups:

| Phase | Teams | Carried Points | Games | Notes |
|-------|-------|---------------|-------|-------|
| **Championship Playoffs** | 1st–4th | 100% | 6 (H&A vs each other) | Title decided here |
| **Europe Playoffs** | 5th–8th | 50% (round **up**) | 6 (H&A vs each other) | European spots |
| **Relegation Playouts** | 9th–14th | 100% | 10 (H&A vs each other) | Bottom 2 relegated |

### Tiebreakers (in order)
Points → H2H points → H2H goal difference → Goal difference → Goals for → Wins → Away goals for → Away wins

## App Features

### 6 Tabs

| Tab | Description | Status |
|-----|-------------|--------|
| **Standings** | League table with dual-handle range slider (MD 1–26). Filter to any matchday range. Zone-colored rows (championship/europe/relegation). | ✅ Complete |
| **Fixtures** | Browse all matchdays. Tap any match to expand and see real goalscorers with minutes. Home goals left-aligned, away goals right-aligned. | ✅ Complete |
| **Minutes ⏱** | Freeze all matches at a specific minute (0'–95'). Recalculates the entire table. Shows position changes vs full-time and count of results that would change. | ✅ Complete |
| **Playoffs** | Auto-generates post-season fixtures based on current standings. Shows carried points table and all matchups for each phase. | ✅ Complete |
| **Predict** | Enter scores for unplayed matches (MD 25–26). Projected standings update live in a side-by-side view. | ✅ Complete |
| **Scenarios** | Select a team + target position. Shows points needed, wins required, remaining fixtures. | ✅ Complete |

### Data Architecture

```
LEAGUE config
├── teams[] — id, name, short, color
└── tiebreakers[]

MATCHES[] — 182 entries (168 played + 14 upcoming)
├── matchday, homeTeamId, awayTeamId
├── played, homeScore, awayScore
└── goals[] — { player, minute, team }

Functions:
├── calcStandings(matches) → sorted standings array
├── calcAtMinute(matches, minute) → standings frozen at minute
└── generatePostSeason(standings) → playoff phases + fixtures
```

## Goal Data

### Current State
- **371 real goals** from soccer365.net (133 matches with full scorer data)
- **19 matches** still missing goal data (scraper parsing issue — see below)
- **11 matches** are 0-0 draws (no goals needed)
- All **168 match scores are 100% correct** — verified against ESPN

### How Goals Are Structured
```javascript
// g(playerName, minute, teamId)
g("Ayoub El Kaabi", 33, "oly")
g("Vicente Taborda", 7, "pao")

// Own goals marked with (OG) suffix
g("Player Name (OG)", 55, "ofi")  // scored for the OTHER team
```

### Team Assignment
Goals from soccer365.net don't include team info. Assignment uses:
1. **Unambiguous matches**: If only one team scored (e.g., 3-0), all goals → that team
2. **Player-team map**: Built from (1), extended with known roster data for ~150 players
3. **Fallback**: Remaining goals assigned to whichever side still needs goals

## Scraper (`scrape_goals.py`)

### How It Works
Fetches match pages from `soccer365.net/games/{gameId}/` and parses goals using CSS selectors:

| Element | Meaning |
|---------|---------|
| `div.live_goal` | Goal event marker |
| `div.live_goal_own` | Own goal marker |
| `div.event_ht_icon` | Home team event |
| `div.event_at_icon` | Away team event |
| `div.event_min` + `<sup>` | Minute (e.g., `90<sup>+3</sup>` → 93) |
| `div.img16 > a` | Scorer name |

### Usage

```bash
pip install requests beautifulsoup4

# Full scrape (all 168 matches):
python scrape_goals.py

# Retry only failed matches:
python scrape_goals.py --retry-failed

# Custom settings:
python scrape_goals.py --retry-failed --delay 5 --timeout 45 --max-retries 5
```

### Output
- `goals_progress_s365.json` — Full results, resume-safe

### Known Issue: Regular-Time Goals Not Captured
The current CSS selector (`div.live_goal`) only finds goals in the **late events timeline** (added time events at the bottom of the page). Goals scored in regular time (e.g., minute 1–89) appear in a **different HTML section** (the score summary header area) with a different structure.

**19 matches still need fixing.** The debug script (`scrape_debug.py`) is set up to inspect the HTML structure of these matches. See "Next Steps" below.

### All 168 Soccer365 Game IDs
Pre-mapped in `scrape_goals.py` — IDs range from 2288339 to 2288506.

## File Structure

```
├── README.md                              # This file
├── greek-super-league-predictor.jsx       # Main React app (single file)
├── scrape_goals.py                        # Goal data scraper
├── scrape_debug.py                        # Debug tool for HTML structure analysis
├── goals_progress_s365.json               # Scraped data (gitignored, generated)
└── .gitignore
```

## Current Standings (MD 24)

| # | Team | Pts | GD |
|---|------|-----|----|
| 1 | AEK Athens | 56 | +29 |
| 2 | PAOK | 54 | +33 |
| 3 | Olympiacos | 54 | +31 |
| 4 | Panathinaikos | 45 | +17 |
| 5 | Levadiakos | 39 | +17 |
| 6 | Aris | 30 | -3 |
| 7 | OFI Crete | 29 | +1 |
| 8 | Atromitos | 29 | -3 |
| 9 | Volos NFC | 25 | -11 |
| 10 | Kifisia | 24 | -6 |
| 11 | Panetolikos | 24 | -12 |
| 12 | AEL Larissa | 21 | -20 |
| 13 | Asteras Tripolis | 19 | -23 |
| 14 | Panserraikos | 18 | -50 |

## Next Steps (Priority Order)

### 1. Fix Scraper for Regular-Time Goals
**Problem**: Soccer365 shows goals in two places:
- **Score summary** (top of page) — all goals, including regular time ← NOT PARSED YET
- **Events timeline** (bottom) — only late/added-time events ← Currently parsed

**Action**: Run `scrape_debug.py` on a match like KIF 3-0 PANS (gid:2288418) where all goals are in regular time. The debug output will show the HTML structure of the score summary section. Update `fetch_goals()` to also parse that section.

### 2. Integrate OG Support in React App
The scraper marks own goals as `"Player Name (OG)"`. The React app should:
- Display "(OG)" in a different color/style when showing goalscorers
- For the Minutes tab: own goals should count for the **opposing** team

### 3. Update MD 25–26 Results
When matchdays 25-26 are played (Mar 14-22, 2026), update the MATCHES array with real scores and run the scraper to get goal data.

### 4. Head-to-Head Tiebreaker
Currently tiebreakers use GD → GF → Wins. Implement proper H2H points/GD calculation for teams level on points.

### 5. Playoff Phase: Live Integration
The Playoffs tab generates fixtures but doesn't track results. When playoffs start (Apr 4), wire up result entry and standings calculation with carried points.

### 6. Team Crests/Logos
Add small team badge images next to team names.

### 7. Backend API
The data layer is designed for easy swap to API calls. Architecture is ready — replace hardcoded MATCHES array with fetch calls.

## Tech Decisions

- **Single JSX file**: Deliberately kept as one file for Claude Artifact compatibility. Can be split into components for a real React project.
- **No external state**: All state is React useState/useMemo. No Redux/Zustand needed at this scale.
- **CSS-in-JS inline styles**: Uses `var(--color-*)` CSS variables for theme support (light/dark mode in Claude UI).
- **No build step needed**: Works directly as a Claude Artifact or with any React setup.

## Data Sources

| Source | Used For | Reliability |
|--------|----------|-------------|
| soccer365.net | Goal data (scorer + minute) | Good, but scraper needs fixing for regular-time goals |
| ESPN | Score verification, scorer cross-reference | Excellent |
| Manual verification | Standings cross-check | All 168 match scores verified correct |

## Contributing

1. Fix the scraper (see Next Steps #1)
2. Run `python scrape_goals.py --retry-failed`
3. Paste the updated `goals_progress_s365.json` data into the React app
4. Verify standings still match (AEK 56, PAOK 54, OLY 54, PAO 45)
