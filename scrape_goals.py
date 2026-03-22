#!/usr/bin/env python3
"""
Greek Super League 2025-26 Goalscorer Scraper
==============================================
Fetches goalscorer data from soccer365.net using proper HTML structure:
  - Goals identified by: div.event_ht_icon.live_goal (home) / div.event_at_icon.live_goal (away)
  - Own goals identified by: live_goal_own class
  - Scorer name from: <a> tag inside div.img16
  - Minute from: div.event_min (with <sup> for added time)

Usage:
    pip install requests beautifulsoup4

    # Full scrape:
    python scrape_goals.py

    # Retry only the 24 failed matches:
    python scrape_goals.py --retry-failed

    # Custom settings:
    python scrape_goals.py --retry-failed --delay 5 --timeout 45
"""

import json
import re
import time
import sys
import argparse
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("pip install requests beautifulsoup4")
    sys.exit(1)

MATCHES = [
    (1,"aris","volos",2,0,2288340),(1,"oly","ast",2,0,2288342),(1,"pane","atro",0,2,2288344),
    (1,"pao","ofi",4,1,2288343),(1,"aek","pans",2,0,2288339),(1,"paok","ael",1,0,2288345),
    (1,"lev","kif",3,2,2288341),(2,"volos","oly",0,2,2288352),(2,"pans","ofi",0,1,2288350),
    (2,"aris","pane",0,2,2288348),(2,"ael","kif",1,1,2288347),(2,"aek","ast",1,0,2288346),
    (2,"pao","lev",1,1,2288349),(2,"paok","atro",1,0,2288351),(3,"oly","pans",5,0,2288358),
    (3,"pane","volos",1,2,2288359),(3,"atro","aris",1,2,2288354),(3,"ast","ael",2,2,2288353),
    (3,"kif","pao",3,2,2288355),(3,"lev","aek",0,1,2288356),(3,"ofi","paok",1,2,2288357),
    (4,"pao","oly",1,1,2288363),(4,"lev","ofi",4,0,2288362),(4,"ael","aek",1,1,2288360),
    (4,"paok","pane",0,0,2288365),(4,"volos","ast",2,1,2288366),(4,"kif","aris",0,1,2288361),
    (4,"pans","atro",1,1,2288364),(5,"oly","lev",3,2,2288372),(5,"pane","pao",1,2,2288373),
    (5,"atro","ael",1,1,2288370),(5,"ast","paok",3,3,2288369),(5,"ofi","kif",1,3,2288371),
    (5,"aek","volos",1,0,2288367),(5,"aris","pans",1,1,2288368),(6,"pao","atro",1,0,2288378),
    (6,"paok","oly",2,1,2288380),(6,"kif","aek",2,3,2288375),(6,"lev","pane",6,0,2288376),
    (6,"ael","volos",2,5,2288374),(6,"ofi","aris",3,0,2288377),(6,"pans","ast",2,1,2288379),
    (7,"aek","paok",0,2,2288381),(7,"aris","pao",1,1,2288383),(7,"volos","pans",2,1,2288387),
    (7,"ast","kif",2,2,2288384),(7,"pane","ofi",4,2,2288386),(7,"atro","lev",2,2,2288385),
    (7,"ael","oly",0,2,2288382),(8,"oly","aek",2,0,2288391),(8,"paok","volos",3,0,2288394),
    (8,"pao","ast",2,0,2288392),(8,"lev","aris",1,1,2288389),(8,"ofi","atro",1,3,2288390),
    (8,"pans","ael",0,2,2288393),(8,"kif","pane",1,1,2288388),(9,"volos","pao",1,0,2288401),
    (9,"atro","kif",1,2,2288398),(9,"oly","aris",2,1,2288399),(9,"ael","lev",0,2,2288396),
    (9,"pans","paok",0,5,2288400),(9,"aek","pane",1,0,2288395),(9,"ast","ofi",3,0,2288397),
    (10,"pao","paok",2,1,2288407),(10,"atro","volos",0,1,2288403),(10,"ofi","aek",0,1,2288406),
    (10,"lev","pans",5,2,2288405),(10,"aris","ast",0,0,2288402),(10,"kif","oly",1,3,2288404),
    (10,"pane","ael",3,0,2288408),(11,"aek","aris",1,0,2288409),(11,"paok","kif",3,0,2288414),
    (11,"pans","pao",0,3,2288413),(11,"oly","atro",3,0,2288412),(11,"ast","pane",1,1,2288411),
    (11,"ael","ofi",1,2,2288410),(11,"volos","lev",1,2,2288415),(12,"pao","aek",2,3,2288421),
    (12,"lev","paok",2,3,2288419),(12,"atro","ast",0,1,2288417),(12,"pane","oly",0,1,2288422),
    (12,"aris","ael",2,1,2288416),(12,"kif","pans",3,0,2288418),(12,"ofi","volos",0,1,2288420),
    (13,"aek","atro",4,1,2288423),(13,"paok","aris",3,1,2288428),(13,"ael","pao",2,2,2288424),
    (13,"oly","ofi",3,0,2288426),(13,"volos","kif",1,1,2288429),(13,"ast","lev",1,1,2288425),
    (13,"pans","pane",0,1,2288427),(14,"lev","ael",3,0,2288433),(14,"ofi","pans",3,0,2288434),
    (14,"kif","ast",0,0,2288432),(14,"pao","volos",2,1,2288435),(14,"aris","oly",0,0,2288430),
    (14,"atro","paok",2,0,2288431),(14,"pane","aek",0,5,2288436),(15,"aek","ofi",2,1,2288437),
    (15,"paok","pao",2,0,2288442),(15,"ael","atro",0,0,2288438),(15,"oly","kif",1,1,2288440),
    (15,"volos","pane",1,0,2288443),(15,"ast","aris",0,1,2288439),(15,"pans","lev",0,2,2288441),
    (16,"kif","ael",1,1,2288446),(16,"atro","oly",0,2,2288445),(16,"pane","paok",0,3,2288450),
    (16,"lev","volos",3,1,2288447),(16,"ofi","ast",4,0,2288448),(16,"aris","aek",1,1,2288444),
    (16,"pao","pans",3,0,2288449),(17,"pans","kif",2,1,2288455),(17,"ael","aris",1,0,2288452),
    (17,"paok","ofi",3,0,2288456),(17,"aek","pao",4,0,2288451),(17,"pane","lev",1,3,2288454),
    (17,"volos","atro",0,3,2288457),(17,"ast","oly",0,3,2288453),(18,"ael","pans",1,0,2288458),
    (18,"ast","aek",0,1,2288460),(18,"oly","volos",1,0,2288464),(18,"aris","lev",2,2,2288459),
    (18,"ofi","pane",1,0,2288463),(18,"atro","pao",0,0,2288461),(18,"kif","paok",1,4,2288462),
    (19,"aek","oly",1,1,2288465),(19,"paok","pans",4,1,2288470),(19,"pao","kif",3,0,2288468),
    (19,"lev","ast",3,1,2288467),(19,"volos","ael",0,2,2288471),(19,"atro","ofi",1,2,2288466),
    (19,"pane","aris",0,1,2288469),(20,"oly","pao",0,1,2288477),(20,"aris","paok",0,0,2288473),
    (20,"ofi","lev",3,2,2288476),(20,"pans","aek",0,4,2288478),(20,"kif","atro",0,1,2288475),
    (20,"ast","volos",2,0,2288474),(20,"ael","pane",1,4,2288472),(21,"lev","oly",0,0,2288481),
    (21,"pane","ast",3,1,2288483),(21,"volos","aris",1,1,2288485),(21,"paok","aek",0,0,2288484),
    (21,"kif","ofi",2,2,2288480),(21,"atro","pans",2,2,2288479),(21,"pao","ael",1,1,2288482),
    (22,"aek","lev",4,0,2288486),(22,"aris","kif",1,1,2288488),(22,"ael","paok",1,1,2288487),
    (22,"ofi","pao",0,2,2288490),(22,"pans","volos",2,1,2288492),(22,"ast","atro",1,2,2288489),
    (22,"oly","pane",2,0,2288491),(23,"ofi","ael",3,0,2288495),(23,"atro","pane",1,0,2288493),
    (23,"kif","lev",1,0,2288494),(23,"pans","oly",1,2,2288497),(23,"volos","aek",2,2,2288499),
    (23,"paok","ast",2,0,2288498),(23,"pao","aris",3,1,2288496),(24,"aris","atro",0,0,2288501),
    (24,"aek","ael",1,0,2288500),(24,"ast","pans",0,1,2288502),(24,"volos","ofi",1,1,2288506),
    (24,"lev","pao",1,4,2288503),(24,"oly","paok",0,0,2288504),(24,"pane","kif",2,1,2288505),
]

KNOWN_FAILED = {
    2288342, 2288418, 2288423, 2288433, 2288435, 2288437, 2288440, 2288439,
    2288446, 2288450, 2288444, 2288455, 2288451, 2288457, 2288458, 2288459,
    2288465, 2288477, 2288482, 2288487, 2288493, 2288496, 2288506, 2288422,
}


def parse_minute(event_min_div):
    """Parse minute from div.event_min, handling added time like 90<sup>+3</sup>."""
    base = ""
    added = ""
    for child in event_min_div.children:
        if hasattr(child, 'name') and child.name == 'sup':
            added = child.get_text(strip=True).lstrip('+')
        elif hasattr(child, 'string') and child.string:
            base = child.string.strip()
        elif isinstance(child, str):
            base += child.strip()

    base = base.rstrip("'").strip()   # strip trailing apostrophe: "14'" → "14"
    try:
        minute = int(base)
        if added:
            minute += int(added)
        return minute
    except (ValueError, TypeError):
        return None


def fetch_goals(gid, session, timeout=30, max_retries=3):
    """Fetch goals from a soccer365 match page using CSS class selectors."""
    url = f"https://soccer365.net/games/{gid}/"

    for attempt in range(1, max_retries + 1):
        try:
            resp = session.get(url, timeout=timeout)
            resp.raise_for_status()
            break
        except Exception as e:
            if attempt < max_retries:
                wait = attempt * 5
                print(f"  retry {attempt}/{max_retries} in {wait}s ({e})")
                time.sleep(wait)
            else:
                return {"goals": [], "error": str(e)}

    soup = BeautifulSoup(resp.text, "html.parser")
    goals = []

    # Find ALL goal markers: div elements with class "live_goal" or "live_goal_own"
    goal_icons = soup.find_all("div", class_=re.compile(r"live_goal"))

    for icon in goal_icons:
        # Determine side: event_ht_icon = home, event_at_icon = away
        icon_classes = " ".join(icon.get("class", []))
        is_own_goal = "live_goal_own" in icon_classes

        if "event_ht_icon" in icon_classes:
            side = "home"
        elif "event_at_icon" in icon_classes:
            side = "away"
        else:
            # Check class on parent's other children
            side = None

        # Skip if this is actually live_game_goal (the score display, not an event)
        if "live_game_goal" in icon_classes:
            continue

        # Navigate to the parent event row
        event_row = icon.parent
        if not event_row:
            continue

        # If icon is inside event_ht or event_at div, go up one more level
        if event_row.name == "div" and any(
            c in (event_row.get("class") or []) for c in ["event_ht", "event_at"]
        ):
            # Determine side from this container if not yet known
            row_classes = " ".join(event_row.get("class", []))
            if side is None:
                if "event_ht" in row_classes:
                    side = "home"
                elif "event_at" in row_classes:
                    side = "away"
            event_row = event_row.parent

        if not event_row:
            continue

        # Get minute from div.event_min in this row
        minute_div = event_row.find("div", class_="event_min")
        minute = parse_minute(minute_div) if minute_div else None

        # Get player name from <a> inside div.img16 on the goal side
        # The goal side is event_ht (home) or event_at (away)
        if side == "home":
            goal_container = event_row.find("div", class_="event_ht")
        elif side == "away":
            goal_container = event_row.find("div", class_="event_at")
        else:
            goal_container = event_row

        player = None
        if goal_container:
            img16 = goal_container.find("div", class_="img16")
            if img16:
                a_tag = img16.find("a")
                if a_tag:
                    player = a_tag.get_text(strip=True)

        if player and minute:
            # For own goals the scoring team is the OPPOSITE of where the icon appears
            # e.g. event_ht_icon OG → own goal by home player → counts for away team
            if is_own_goal:
                scoring_side = "away" if side == "home" else "home"
            else:
                scoring_side = side
            goal_entry = {
                "player": f"{player} (OG)" if is_own_goal else player,
                "minute": minute,
                "side": scoring_side,   # "home" or "away" — which team the goal counts for
            }
            goals.append(goal_entry)

    return {"goals": goals}


def main():
    ap = argparse.ArgumentParser(description="Greek SL goal scraper (v2 — CSS selectors)")
    ap.add_argument("--retry-failed", action="store_true",
                    help="Only retry the 24 known failed matches")
    ap.add_argument("--input", default="goals_progress_s365.json",
                    help="Progress file to load/update")
    ap.add_argument("--delay", type=float, default=3.0,
                    help="Seconds between requests (default 3)")
    ap.add_argument("--timeout", type=int, default=30,
                    help="HTTP timeout in seconds (default 30)")
    ap.add_argument("--max-retries", type=int, default=3,
                    help="Max retries per request (default 3)")
    args = ap.parse_args()

    progress = Path(args.input)
    results = {}
    if progress.exists():
        with open(progress) as f:
            results = json.load(f)
        print(f"Loaded {len(results)} results from {progress}")

    # Build fetch list
    to_fetch = []
    for md, home, away, hs, aws, gid in MATCHES:
        key = str(gid)
        if args.retry_failed:
            entry = results.get(key)
            needs = (gid in KNOWN_FAILED
                     or (entry and entry.get("error"))
                     or (entry and not entry.get("goals") and hs + aws > 0)
                     or (not entry and hs + aws > 0))
            if needs:
                to_fetch.append((md, home, away, hs, aws, gid))
        else:
            if key not in results and hs + aws > 0:
                to_fetch.append((md, home, away, hs, aws, gid))

    mode = "--retry-failed" if args.retry_failed else "full"
    print(f"\nMode: {mode} | To fetch: {len(to_fetch)} matches")
    print(f"Settings: delay={args.delay}s, timeout={args.timeout}s, retries={args.max_retries}")
    print(f"Parser: CSS selector (div.live_goal + div.live_goal_own)\n")

    if not to_fetch:
        print("Nothing to fetch!")
        return

    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                      "AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.5",
    })

    fetched = errors = 0
    for idx, (md, home, away, hs, aws, gid) in enumerate(to_fetch):
        key = str(gid)
        print(f"[{idx+1}/{len(to_fetch)}] MD{md}: {home} {hs}-{aws} {away} (gid:{gid})...",
              end=" ", flush=True)

        r = fetch_goals(gid, session, args.timeout, args.max_retries)
        results[key] = {"md": md, "home": home, "away": away, **r}
        fetched += 1

        if r.get("error"):
            errors += 1
            print(f"ERROR: {r['error']}")
        else:
            exp = hs + aws
            got = len(r["goals"])
            names = ", ".join(f"{g['player']} {g['minute']}'" for g in r["goals"])
            if got == exp:
                print(f"✓ {names}")
            else:
                print(f"⚠ {got}/{exp} — {names}")

        if fetched % 5 == 0:
            with open("goals_progress_s365.json", "w") as f:
                json.dump(results, f, indent=2, ensure_ascii=False)

        time.sleep(args.delay)

    # Final save
    with open("goals_progress_s365.json", "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    # Summary
    tg = te = mwg = mwe = 0
    for md, home, away, hs, aws, gid in MATCHES:
        e = results.get(str(gid), {})
        te += hs + aws
        if e.get("error") or (not e.get("goals") and hs + aws > 0):
            mwe += 1
        elif e.get("goals"):
            tg += len(e["goals"])
            mwg += 1

    print(f"\n{'='*50}")
    print(f"Goals found: {tg}/{te} | With data: {mwg} | Errors: {mwe}")
    print(f"Output: goals_progress_s365.json")
    if mwe:
        print(f"\nStill failed ({mwe}):")
        for md, h, a, hs, aws, gid in MATCHES:
            e = results.get(str(gid), {})
            if e.get("error") or (not e.get("goals") and hs + aws > 0):
                print(f"  MD{md}: {h} {hs}-{aws} {a}")
        print(f"\nRun again: python scrape_goals.py --retry-failed")


if __name__ == "__main__":
    main()
