"""Backfill past Research & News editions (Section G5).

Builds editions for the previous N weekdays (ET) that don't have a ready one,
so the date picker has history from day one:

    python backfill_news.py 30

Needs DATABASE_URL and FINNHUB_API_KEY in the environment. Each edition is
~31 Finnhub calls spaced 1.1s apart, so 30 days takes roughly 16 minutes.
"""
from __future__ import annotations

import sys
import time
from datetime import date, timedelta

import app

MAX_DAYS = 365  # Finnhub's free tier covers one year of company news


def previous_weekdays(today: date, n: int) -> list[date]:
    days: list[date] = []
    d = today
    while len(days) < n:
        d -= timedelta(days=1)
        if d.weekday() < 5:
            days.append(d)
    return days


def main(argv: list[str]) -> int:
    try:
        n = int(argv[1]) if len(argv) > 1 else 30
        if not 1 <= n <= MAX_DAYS:
            raise ValueError
    except ValueError:
        print(f"usage: python backfill_news.py [days 1-{MAX_DAYS}]", file=sys.stderr)
        return 2
    if not app.DATABASE_URL:
        print("DATABASE_URL is not set.", file=sys.stderr)
        return 1

    days = previous_weekdays(app._et_today(), n)
    conn = app.get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT edition_date FROM news_editions WHERE status = 'ready' AND edition_date = ANY(%s)",
        (days,),
    )
    have = {row[0] for row in cur.fetchall()}
    cur.close()
    conn.close()

    todo = [d for d in days if d not in have]  # newest first
    calls_each = 1 + sum(len(t) for t in app.NEWS_SECTORS.values())
    eta_min = len(todo) * calls_each * app.NEWS_CALL_SPACING / 60
    print(
        f"{n} weekdays: {len(have)} already ready, {len(todo)} to build "
        f"(~{calls_each} Finnhub calls each, ~{eta_min:.0f} min)",
        flush=True,
    )

    results: dict[str, int] = {}
    started = time.time()
    for i, d in enumerate(todo, 1):
        if i > 1:
            time.sleep(app.NEWS_CALL_SPACING)
        t0 = time.time()
        status = app.build_news_edition(d)
        results[status] = results.get(status, 0) + 1
        print(f"[{i}/{len(todo)}] {d.isoformat()}: {status} ({time.time() - t0:.0f}s)", flush=True)

    summary = ", ".join(f"{k}={v}" for k, v in sorted(results.items())) or "nothing to do"
    print(f"Done in {(time.time() - started) / 60:.1f} min: {summary}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
