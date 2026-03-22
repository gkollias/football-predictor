#!/usr/bin/env python3
"""
apply_goals.py
==============
Reads goals_progress_s365.json and patches the MATCHES array in App.jsx,
replacing empty goals arrays with real scraped data.

Usage:
    python3 apply_goals.py
"""

import json, re, sys
from pathlib import Path

JSON_FILE  = Path("goals_progress_s365.json")
APP_FILE   = Path("greek-sl-sim/src/App.jsx")

# Maps (md, homeId, awayId) → gid so we can look up scraped goals
MATCH_GIDS = {
    (1,"aris","volos"):2288340,(1,"oly","ast"):2288342,(1,"pane","atro"):2288344,
    (1,"pao","ofi"):2288343,(1,"aek","pans"):2288339,(1,"paok","ael"):2288345,
    (1,"lev","kif"):2288341,(2,"volos","oly"):2288352,(2,"pans","ofi"):2288350,
    (2,"aris","pane"):2288348,(2,"ael","kif"):2288347,(2,"aek","ast"):2288346,
    (2,"pao","lev"):2288349,(2,"paok","atro"):2288351,(3,"oly","pans"):2288358,
    (3,"pane","volos"):2288359,(3,"atro","aris"):2288354,(3,"ast","ael"):2288353,
    (3,"kif","pao"):2288355,(3,"lev","aek"):2288356,(3,"ofi","paok"):2288357,
    (4,"pao","oly"):2288363,(4,"lev","ofi"):2288362,(4,"ael","aek"):2288360,
    (4,"paok","pane"):2288365,(4,"volos","ast"):2288366,(4,"kif","aris"):2288361,
    (4,"pans","atro"):2288364,(5,"oly","lev"):2288372,(5,"pane","pao"):2288373,
    (5,"atro","ael"):2288370,(5,"ast","paok"):2288369,(5,"ofi","kif"):2288371,
    (5,"aek","volos"):2288367,(5,"aris","pans"):2288368,(6,"pao","atro"):2288378,
    (6,"paok","oly"):2288380,(6,"kif","aek"):2288375,(6,"lev","pane"):2288376,
    (6,"ael","volos"):2288374,(6,"ofi","aris"):2288377,(6,"pans","ast"):2288379,
    (7,"aek","paok"):2288381,(7,"aris","pao"):2288383,(7,"volos","pans"):2288387,
    (7,"ast","kif"):2288384,(7,"pane","ofi"):2288386,(7,"atro","lev"):2288385,
    (7,"ael","oly"):2288382,(8,"oly","aek"):2288391,(8,"paok","volos"):2288394,
    (8,"pao","ast"):2288392,(8,"lev","aris"):2288389,(8,"ofi","atro"):2288390,
    (8,"pans","ael"):2288393,(8,"kif","pane"):2288388,(9,"volos","pao"):2288401,
    (9,"atro","kif"):2288398,(9,"oly","aris"):2288399,(9,"ael","lev"):2288396,
    (9,"pans","paok"):2288400,(9,"aek","pane"):2288395,(9,"ast","ofi"):2288397,
    (10,"pao","paok"):2288407,(10,"atro","volos"):2288403,(10,"ofi","aek"):2288406,
    (10,"lev","pans"):2288405,(10,"aris","ast"):2288402,(10,"kif","oly"):2288404,
    (10,"pane","ael"):2288408,(11,"aek","aris"):2288409,(11,"paok","kif"):2288414,
    (11,"pans","pao"):2288413,(11,"oly","atro"):2288412,(11,"ast","pane"):2288411,
    (11,"ael","ofi"):2288410,(11,"volos","lev"):2288415,(12,"pao","aek"):2288421,
    (12,"lev","paok"):2288419,(12,"atro","ast"):2288417,(12,"pane","oly"):2288422,
    (12,"aris","ael"):2288416,(12,"kif","pans"):2288418,(12,"ofi","volos"):2288420,
    (13,"aek","atro"):2288423,(13,"paok","aris"):2288428,(13,"ael","pao"):2288424,
    (13,"oly","ofi"):2288426,(13,"volos","kif"):2288429,(13,"ast","lev"):2288425,
    (13,"pans","pane"):2288427,(14,"lev","ael"):2288433,(14,"ofi","pans"):2288434,
    (14,"kif","ast"):2288432,(14,"pao","volos"):2288435,(14,"aris","oly"):2288430,
    (14,"atro","paok"):2288431,(14,"pane","aek"):2288436,(15,"aek","ofi"):2288437,
    (15,"paok","pao"):2288442,(15,"ael","atro"):2288438,(15,"oly","kif"):2288440,
    (15,"volos","pane"):2288443,(15,"ast","aris"):2288439,(15,"pans","lev"):2288441,
    (16,"kif","ael"):2288446,(16,"atro","oly"):2288445,(16,"pane","paok"):2288450,
    (16,"lev","volos"):2288447,(16,"ofi","ast"):2288448,(16,"aris","aek"):2288444,
    (16,"pao","pans"):2288449,(17,"pans","kif"):2288455,(17,"ael","aris"):2288452,
    (17,"paok","ofi"):2288456,(17,"aek","pao"):2288451,(17,"pane","lev"):2288454,
    (17,"volos","atro"):2288457,(17,"ast","oly"):2288453,(18,"ael","pans"):2288458,
    (18,"ast","aek"):2288460,(18,"oly","volos"):2288464,(18,"aris","lev"):2288459,
    (18,"ofi","pane"):2288463,(18,"atro","pao"):2288461,(18,"kif","paok"):2288462,
    (19,"aek","oly"):2288465,(19,"paok","pans"):2288470,(19,"pao","kif"):2288468,
    (19,"lev","ast"):2288467,(19,"volos","ael"):2288471,(19,"atro","ofi"):2288466,
    (19,"pane","aris"):2288469,(20,"oly","pao"):2288477,(20,"aris","paok"):2288473,
    (20,"ofi","lev"):2288476,(20,"pans","aek"):2288478,(20,"kif","atro"):2288475,
    (20,"ast","volos"):2288474,(20,"ael","pane"):2288472,(21,"lev","oly"):2288481,
    (21,"pane","ast"):2288483,(21,"volos","aris"):2288485,(21,"paok","aek"):2288484,
    (21,"kif","ofi"):2288480,(21,"atro","pans"):2288479,(21,"pao","ael"):2288482,
    (22,"aek","lev"):2288486,(22,"aris","kif"):2288488,(22,"ael","paok"):2288487,
    (22,"ofi","pao"):2288490,(22,"pans","volos"):2288492,(22,"ast","atro"):2288489,
    (22,"oly","pane"):2288491,(23,"ofi","ael"):2288495,(23,"atro","pane"):2288493,
    (23,"kif","lev"):2288494,(23,"pans","oly"):2288497,(23,"volos","aek"):2288499,
    (23,"paok","ast"):2288498,(23,"pao","aris"):2288496,(24,"aris","atro"):2288501,
    (24,"aek","ael"):2288500,(24,"ast","pans"):2288502,(24,"volos","ofi"):2288506,
    (24,"lev","pao"):2288503,(24,"oly","paok"):2288504,(24,"pane","kif"):2288505,
}

def goals_to_js(goals, home_id, away_id):
    """Convert scraped goals list to JS g() call string."""
    parts = []
    for goal in sorted(goals, key=lambda g: g["minute"]):
        player = goal["player"].replace('"', '\\"')
        minute = goal["minute"]
        side   = goal.get("side")
        if side == "home":
            team = home_id
        elif side == "away":
            team = away_id
        else:
            # Fallback: skip goals without side info
            print(f"  WARNING: no side for {player} {minute}' — skipping")
            continue
        parts.append(f'g("{player}",{minute},"{team}")')
    return "[" + ",".join(parts) + "]"


def main():
    if not JSON_FILE.exists():
        print(f"ERROR: {JSON_FILE} not found. Run scrape_goals.py first.")
        sys.exit(1)

    with open(JSON_FILE) as f:
        scraped = json.load(f)

    app_text = APP_FILE.read_text()
    replaced = skipped = errors = 0

    # Regex to match m(md,"home","away",hs,as_,[]) lines — the empty goals array
    # We'll do targeted replacements for each match we have data for
    for (md, home, away), gid in MATCH_GIDS.items():
        entry = scraped.get(str(gid))
        if not entry:
            continue
        goals = entry.get("goals", [])
        if not goals:
            continue  # No goals to add (or 0-0 draw)

        # Check all goals have side info
        if not all("side" in g for g in goals):
            print(f"  SKIP MD{md} {home} vs {away}: goals missing side info (re-run scraper)")
            skipped += 1
            continue

        # Build the JS goals array
        js_goals = goals_to_js(goals, home, away)

        # Pattern: m(md,"home","away",hs,as_,[]) — match the empty array version
        # We need to find the actual scores from the existing line
        pattern = rf'm\({md},"{home}","{away}",(\d+),(\d+),\[\]\)'
        match = re.search(pattern, app_text)
        if not match:
            # Already has goals or not found
            continue

        hs, aws = int(match.group(1)), int(match.group(2))
        got = len(goals)
        exp = hs + aws

        old = match.group(0)
        new = f'm({md},"{home}","{away}",{hs},{aws},{js_goals})'
        app_text = app_text.replace(old, new, 1)
        replaced += 1

        status = "✓" if got == exp else f"⚠ {got}/{exp}"
        print(f"{status}  MD{md}: {home} {hs}-{aws} {away}")
        if got != exp:
            errors += 1

    APP_FILE.write_text(app_text)
    print(f"\nDone: {replaced} matches updated, {skipped} skipped (no side), {errors} partial")


if __name__ == "__main__":
    main()
