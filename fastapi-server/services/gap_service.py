from services.scoring_service import compute_probability

def detect_gap(paper):
    sim = paper["similarity"]
    time_gap = paper["patent_year"] - paper["paper_year"]
    novelty = paper.get("novelty", 0.5)

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
        "similarity": sim,
        "time_gap": time_gap,
        "gap_type": gap,
        "probability": probability
    }


def get_summary(data):
    total = len(data)

    high = sum(1 for d in data if d["gap_type"] == "High Potential")
    delayed = sum(1 for d in data if d["gap_type"] == "Delayed Innovation")
    weak = sum(1 for d in data if d["gap_type"] == "Weak Research")

    avg_time = sum(d["time_gap"] for d in data) / total

    return {
        "total_papers": total,
        "high_potential": high,
        "delayed": delayed,
        "weak": weak,
        "avg_time_gap": round(avg_time, 2)
    }