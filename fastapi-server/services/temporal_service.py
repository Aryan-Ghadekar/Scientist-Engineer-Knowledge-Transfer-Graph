def get_temporal_analysis(data):
    rows = []

    for d in data:
        paper_year = d.get("paper_year")
        patent_year = d.get("patent_year")

        if not paper_year or not patent_year:
            continue

        time_gap = patent_year - paper_year

        rows.append({
            "paper_id": d.get("paper_id"),
            "paper_title": d.get("paper_title"),   # ✅ ADD THIS
            "paper_year": paper_year,
            "patent_title": d.get("patent_title"), # ✅ ADD THIS
            "patent_year": patent_year,
            "time_gap": time_gap
        })

    # stats
    gaps = [r["time_gap"] for r in rows]

    avg = sum(gaps) / len(gaps) if gaps else 0

    return {
        "avg_lag": round(avg, 2),
        "max_lag": max(gaps) if gaps else 0,
        "min_lag": min(gaps) if gaps else 0,
        "total_pairs": len(rows),
        "rows": rows
    }