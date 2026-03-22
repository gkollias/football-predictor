#!/usr/bin/env python3
"""Debug v3: dump the score summary section where regular-time goals appear."""
import re, sys
try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("pip install requests beautifulsoup4"); sys.exit(1)

# Use a match where ALL goals were in regular time (not 90+)
# MD12: KIF 3-0 PANS — scraper found 0 goals
GID = 2288418

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
})

print(f"Fetching soccer365.net/games/{GID}/ (KIF 3-0 PANS)...")
resp = session.get(f"https://soccer365.net/games/{GID}/", timeout=30)
print(f"Status: {resp.status_code}, Length: {len(resp.text)}")

soup = BeautifulSoup(resp.text, "html.parser")
out = []

# 1. Find the live_game sections (score display area)
out.append("=" * 70)
out.append("1. LIVE_GAME SECTIONS (score area)")
out.append("=" * 70)
for el in soup.find_all("div", class_=re.compile(r"live_game")):
    classes = " ".join(el.get("class", []))
    out.append(f"\n<div class='{classes}'>")
    out.append(f"  HTML: {str(el)[:500]}")

# 2. Find the parent of live_game — should contain goal summaries
out.append("\n" + "=" * 70)
out.append("2. PARENT OF LIVE_GAME (should have goal names)")
out.append("=" * 70)
live_games = soup.find_all("div", class_="live_game")
if live_games:
    parent = live_games[0].parent
    if parent:
        out.append(f"Parent: <{parent.name} class='{' '.join(parent.get('class', []))}'>")
        out.append(f"Full HTML ({len(str(parent))} chars):")
        out.append(str(parent)[:3000])

# 3. Search for div.live_goal in the FULL page (not just events section)
out.append("\n" + "=" * 70)
out.append("3. ALL div.live_goal ON PAGE")
out.append("=" * 70)
for el in soup.find_all("div", class_=re.compile(r"live_goal")):
    classes = " ".join(el.get("class", []))
    parent_html = str(el.parent)[:200] if el.parent else "no parent"
    out.append(f"  <div class='{classes}'> parent: {parent_html}")

# 4. Raw HTML search for common goal display patterns
out.append("\n" + "=" * 70)
out.append("4. RAW HTML SEARCH FOR GOAL PATTERNS")
out.append("=" * 70)
html = resp.text

# Search for goal-related class patterns
for pattern in [r'live_goal["\s]', r'goal_info', r'goal_row', r'goals_block',
                r'game_goals', r'score_goals', r'goalscorer', r'goal_time']:
    matches = re.findall(f'.{{0,100}}{pattern}.{{0,100}}', html)
    if matches:
        out.append(f"\nPattern '{pattern}': {len(matches)} matches")
        for m in matches[:3]:
            out.append(f"  {m.strip()}")

# 5. Find where the score "3" and "0" appear in structured elements
out.append("\n" + "=" * 70)
out.append("5. SCORE NUMBER ELEMENTS")
out.append("=" * 70)
for el in soup.find_all("div", class_="live_game_goal"):
    out.append(f"\n<div class='live_game_goal'> text={el.get_text(strip=True)}")
    out.append(f"  Full element: {str(el)[:300]}")
    # Check siblings
    if el.parent:
        for sib in el.parent.children:
            if hasattr(sib, 'name') and sib.name:
                out.append(f"  sibling: <{sib.name} class='{' '.join(sib.get('class',[]))}'>  text={sib.get_text(strip=True)[:60]}")

# 6. Look for player links near the scoreline
out.append("\n" + "=" * 70)
out.append("6. ANCHOR TAGS IN SCORE SECTION (first 5000 chars of HTML)")
out.append("=" * 70)
# The score section is usually in the first portion of the body
early_html = html[:15000]
player_links = re.findall(r'<a[^>]*href="/players/[^"]*"[^>]*>([^<]+)</a>', early_html)
out.append(f"Player links in first 15k chars: {player_links}")

result = "\n".join(out)
with open("debug_events.txt", "w") as f:
    f.write(result)

print(f"\nSaved: debug_events.txt ({len(result)} chars)")
print(result)
