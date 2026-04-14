def compute_probability(similarity, time_gap, novelty):
    time_score = 1 / (1 + time_gap)

    probability = (
        0.5 * similarity +
        0.3 * time_score +
        0.2 * novelty
    )

    return round(probability, 3)