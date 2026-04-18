def compute_probability(similarity, novelty, time_gap):
    similarity = float(similarity)
    novelty = float(novelty)
    time_gap = float(time_gap)

    score = (0.5 * similarity) + (0.3 * novelty) - (0.2 * (time_gap / 50))
    return score