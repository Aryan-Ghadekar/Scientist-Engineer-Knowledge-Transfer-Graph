export interface ReviewScore {
  novelty: number;
  technical_soundness: number;
  clarity: number;
  experimental_rigor: number;
  related_work: number;
  reproducibility: number;
  significance: number;
  ethics: number;
}

export interface Signal {
  type: string;
  severity: string;
  location: string;
  excerpt: string;
  explanation: string;
}

export interface ReviewResponse {
  status: string;

  file: {
    name: string;
    pages: number;
    word_count: number;
    title: string;
    author: string;
  };

  peer_review: {
    overall_verdict: string;
    confidence: string;
    overall_score: number;
    scores: ReviewScore;

    strengths: string[];
    weaknesses: string[];
    major_concerns: string[];
    minor_concerns: string[];
    questions_for_authors: string[];

    summary: string;
    detailed_review: string;
    recommendation_rationale: string;
  };

  plagiarism_analysis: {
    plagiarism_likelihood: string;
    estimated_plagiarism_percentage: number;
    confidence: string;
    overall_assessment: string;

    signals_found: Signal[];

    clean_sections: string[];
    high_risk_sections: string[];

    recommendations: string[];
  };
}