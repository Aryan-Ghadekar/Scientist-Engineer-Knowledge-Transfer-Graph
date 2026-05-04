from services.scoring_service import compute_probability

def detect_gap(paper):
    sim = paper.get("similarity", 0)
    novelty = paper.get("novelty", 0.5)

    paper_year = paper.get("paper_year")
    patent_year = paper.get("patent_year")

    if paper_year is None or patent_year is None:
        time_gap = 0
    else:
        time_gap = max(0, patent_year - paper_year)

    probability = compute_probability(sim, time_gap, novelty)

    if sim == 0:
        gap = "No Transfer"
    elif 0.6 < sim < 0.8:
        gap = "High Potential"
    elif time_gap > 5:
        gap = "Delayed Innovation"
    elif sim < 0.4:
        gap = "Weak Research"
    else:
        gap = "Converted"

    return {
        "paper_id": paper["paper_id"],
        "paper_title": paper["paper_title"],
        "patent_title": paper["patent_title"],
        "similarity": sim,
        "time_gap": time_gap,
        "gap_type": gap,
        "probability": probability
    }


# ---------- SUMMARY ----------
def get_summary(data):
    total = len(data)

    return {
        "total_papers": total,
        "high_potential": sum(1 for d in data if d["gap_type"] == "High Potential"),
        "delayed": sum(1 for d in data if d["gap_type"] == "Delayed Innovation"),
        "weak": sum(1 for d in data if d["gap_type"] == "Weak Research"),
        "avg_time_gap": round(sum(d["time_gap"] for d in data) / total, 2) if total else 0
    }


# ---------- TOP PAPERS ----------
def get_top_papers(data):
    return sorted(data, key=lambda x: x["probability"], reverse=True)[:5]


# ---------- DOMAIN ANALYSIS (NO DOMAIN → USE TITLE KEYWORDS) ----------
def get_domainwise_analysis(data):
    domains = {}

    for d in data:
        title = d["paper_title"].lower()

        if "ai" in title or "neural" in title:
            domain = "AI"
        elif "quantum" in title:
            domain = "Quantum"
        elif "network" in title:
            domain = "Networking"
        else:
            domain = "Other"

        domains.setdefault(domain, []).append(d)

    return {
        k: {
            "count": len(v),
            "avg_probability": round(sum(x["probability"] for x in v) / len(v), 3)
        }
        for k, v in domains.items()
    }


import heapq

def rank_papers(papers):
    heap = []

    for p in papers:
        # ✅ ensure numeric conversion (fix your previous error also)
        novelty = float(p.get("novelty", 0))
        cited = float(p.get("cited", 0))
        probability = float(p.get("prediction", {}).get("probability", 0))

        # ✅ compute priority
        priority = (
            -(novelty * 0.5 + cited * 0.3 + probability * 0.2)
        )

        heapq.heappush(heap, (priority, p))

    ranked = []
    rank = 1

    while heap:
        priority, paper = heapq.heappop(heap)

        ranked.append({
            "rank": rank,
            "priority_score": round(-priority, 4),  # convert back to positive
            "paper": paper
        })

        rank += 1

    return ranked