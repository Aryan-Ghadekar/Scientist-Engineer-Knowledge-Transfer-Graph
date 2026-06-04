"""
paper_review.py  —  Research Paper Quality Review Route
========================================================
Paste this file into your project and add to main.py:

    from paper_review import router as paper_review_router
    app.include_router(paper_review_router)

Requirements (add to requirements.txt):
    fastapi
    python-multipart
    openai>=1.0.0
    pymupdf          # fitz — PDF text + image extraction
    pillow
    python-dotenv    # optional, for .env support

Set env var:  OPENAI_API_KEY=sk-...
"""

import os
import io
import base64
import tempfile
from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF
from PIL import Image

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from openai import OpenAI

# ── Router ─────────────────────────────────────────────────────────────────────
router = APIRouter(prefix="/paper-review", tags=["Paper Review"])

# ── OpenAI client ──────────────────────────────────────────────────────────────
def get_openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY environment variable not set."
        )
    return OpenAI(api_key=api_key)


# ── Strict Peer-Review Prompt ──────────────────────────────────────────────────
# Researched from ACL/NeurIPS/IEEE review criteria and meta-review frameworks.
SYSTEM_PROMPT = """You are a strict, experienced senior academic peer reviewer with 15+ years of 
experience reviewing papers for top-tier venues (NeurIPS, ICML, ACL, IEEE, Nature, Science, ACM).

Your job is to evaluate research papers with the same rigor as a top conference program committee.
Be critical, precise, and evidence-based. Do NOT be lenient or overly encouraging.

You evaluate papers on the following 8 dimensions. Score each from 1–10:

1. **Novelty & Originality** — Is the contribution genuinely new? Does it advance the state of the art?
2. **Technical Soundness** — Are the methods, proofs, experiments, and claims rigorous and correct?
3. **Clarity & Writing Quality** — Is the paper well-structured, clearly written, and easy to follow?
4. **Experimental Rigor** — Are baselines fair? Are ablations done? Are results statistically significant?
5. **Related Work Coverage** — Is prior work cited thoroughly and is positioning accurate?
6. **Reproducibility** — Are implementation details, hyperparameters, and data sufficient to reproduce?
7. **Significance & Impact** — Will this paper matter to the field? Does it solve a real problem?
8. **Ethical Considerations** — Are limitations, biases, and societal impacts acknowledged?

Return your review in the following strict JSON format (no extra keys, no markdown fences):

{
  "overall_verdict": "STRONG ACCEPT | ACCEPT | WEAK ACCEPT | BORDERLINE | WEAK REJECT | REJECT | STRONG REJECT",
  "confidence": "HIGH | MEDIUM | LOW",
  "overall_score": <1-10 float>,
  "scores": {
    "novelty": <1-10>,
    "technical_soundness": <1-10>,
    "clarity": <1-10>,
    "experimental_rigor": <1-10>,
    "related_work": <1-10>,
    "reproducibility": <1-10>,
    "significance": <1-10>,
    "ethics": <1-10>
  },
  "strengths": ["<point 1>", "<point 2>", ...],
  "weaknesses": ["<point 1>", "<point 2>", ...],
  "major_concerns": ["<critical issue 1>", ...],
  "minor_concerns": ["<minor issue 1>", ...],
  "questions_for_authors": ["<question 1>", ...],
  "summary": "<2-3 sentence summary of the paper>",
  "detailed_review": "<Your full peer review narrative, at least 300 words>",
  "recommendation_rationale": "<Explain precisely why this paper should/should not be accepted>"
}"""

USER_PROMPT_TEMPLATE = """Please perform a rigorous peer review of the following research paper.

--- PAPER TEXT START ---
{text}
--- PAPER TEXT END ---

{image_note}

Apply the strictest academic standards. If the paper has fatal flaws, say so clearly.
Respond ONLY with valid JSON matching the schema in the system prompt."""


# ── PDF Extraction Helpers ─────────────────────────────────────────────────────

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract full text from PDF using PyMuPDF."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages_text = []
    for page_num, page in enumerate(doc):
        text = page.get_text("text")
        if text.strip():
            pages_text.append(f"[Page {page_num + 1}]\n{text.strip()}")
    doc.close()
    full_text = "\n\n".join(pages_text)
    # Truncate to ~120k chars to stay within token limits
    if len(full_text) > 120_000:
        full_text = full_text[:120_000] + "\n\n[... truncated for length ...]"
    return full_text


def extract_images_from_pdf(pdf_bytes: bytes, max_images: int = 10) -> list[dict]:
    """
    Extract embedded images from PDF pages.
    Returns list of {"page": int, "index": int, "base64": str, "mime": str}
    Skips tiny images (likely icons/decorations) under 5KB.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    extracted = []

    for page_num, page in enumerate(doc):
        if len(extracted) >= max_images:
            break
        image_list = page.get_images(full=True)
        for img_index, img in enumerate(image_list):
            if len(extracted) >= max_images:
                break
            xref = img[0]
            try:
                base_image = doc.extract_image(xref)
                img_bytes = base_image["image"]
                # Skip tiny decorative images
                if len(img_bytes) < 5_000:
                    continue
                ext = base_image["ext"]
                mime = f"image/{ext}" if ext not in ("jpg",) else "image/jpeg"
                # Convert to RGB PNG via Pillow for consistency
                pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
                # Resize if very large to save tokens
                if pil_img.width > 1024 or pil_img.height > 1024:
                    pil_img.thumbnail((1024, 1024), Image.LANCZOS)
                buf = io.BytesIO()
                pil_img.save(buf, format="PNG")
                b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
                extracted.append({
                    "page": page_num + 1,
                    "index": img_index,
                    "base64": b64,
                    "mime": "image/png"
                })
            except Exception:
                continue  # skip corrupted images silently

    doc.close()
    return extracted


def render_pages_as_images(pdf_bytes: bytes, max_pages: int = 3) -> list[dict]:
    """
    Rasterize first N pages as images for visual layout analysis.
    Useful when PDF has charts, tables, or complex layouts.
    Returns list of {"page": int, "base64": str, "mime": str}
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    rendered = []
    pages_to_render = min(max_pages, len(doc))

    for page_num in range(pages_to_render):
        page = doc[page_num]
        mat = fitz.Matrix(1.5, 1.5)  # 108 DPI — balance quality vs tokens
        pix = page.get_pixmap(matrix=mat, colorspace=fitz.csRGB)
        img_bytes = pix.tobytes("png")
        b64 = base64.b64encode(img_bytes).decode("utf-8")
        rendered.append({
            "page": page_num + 1,
            "base64": b64,
            "mime": "image/png"
        })

    doc.close()
    return rendered


# ── Build Vision Message ───────────────────────────────────────────────────────

def build_vision_content(text: str, images: list[dict], rendered_pages: list[dict]) -> list:
    """
    Build the content array for GPT-4o with text + images.
    """
    all_images = rendered_pages + images  # pages first, then embedded figures

    image_note = ""
    if all_images:
        image_note = (
            f"I have also provided {len(all_images)} image(s) from the paper "
            "(rendered pages and/or extracted figures). Please factor them into your review."
        )

    user_text = USER_PROMPT_TEMPLATE.format(text=text, image_note=image_note)

    content = [{"type": "text", "text": user_text}]

    for img_data in all_images[:12]:  # cap at 12 images total
        content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:{img_data['mime']};base64,{img_data['base64']}",
                "detail": "low"  # use "high" for richer analysis (costs more)
            }
        })

    return content


# ── Main Route ─────────────────────────────────────────────────────────────────

@router.post(
    "/review",
    summary="Review a research paper PDF",
    description=(
        "Upload a research paper PDF. The API extracts text and figures, "
        "then uses GPT-4o to perform a strict peer review with scores, "
        "strengths/weaknesses, and an accept/reject verdict."
    ),
    response_class=JSONResponse,
)
async def review_paper(
    file: UploadFile = File(..., description="Research paper PDF"),
    include_images: bool = Form(
        True,
        description="Extract and send embedded figures/images to the model (costs more tokens)"
    ),
    render_first_pages: bool = Form(
        True,
        description="Rasterize first 2 pages for visual layout analysis"
    ),
):
    # ── Validate file type ───────────────────────────────────────────────
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    pdf_bytes = await file.read()
    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(pdf_bytes) > 50 * 1024 * 1024:  # 50MB limit
        raise HTTPException(status_code=400, detail="File too large. Max 50MB.")

    # ── Extract content ──────────────────────────────────────────────────
    try:
        text = extract_text_from_pdf(pdf_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to extract PDF text: {e}")

    if len(text.strip()) < 200:
        raise HTTPException(
            status_code=422,
            detail="Could not extract readable text. The PDF may be scanned/image-only."
        )

    extracted_images: list[dict] = []
    rendered_pages: list[dict] = []

    if include_images:
        try:
            extracted_images = extract_images_from_pdf(pdf_bytes, max_images=8)
        except Exception:
            extracted_images = []  # non-fatal

    if render_first_pages:
        try:
            rendered_pages = render_pages_as_images(pdf_bytes, max_pages=2)
        except Exception:
            rendered_pages = []  # non-fatal

    # ── Call GPT-4o ──────────────────────────────────────────────────────
    client = get_openai_client()

    content = build_vision_content(text, extracted_images, rendered_pages)

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": content},
            ],
            max_tokens=3000,
            temperature=0.2,  # low temp for consistent, analytical output
            response_format={"type": "json_object"},
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenAI API error: {e}")

    raw_review = response.choices[0].message.content

    # ── Parse JSON safely ────────────────────────────────────────────────
    import json
    try:
        review_data = json.loads(raw_review)
    except json.JSONDecodeError:
        # Return raw string if parsing fails
        review_data = {"raw_review": raw_review}

    # ── Build response ───────────────────────────────────────────────────
    return JSONResponse(
        content={
            "status": "success",
            "filename": file.filename,
            "pages_extracted": text.count("[Page "),
            "images_extracted": len(extracted_images),
            "pages_rendered": len(rendered_pages),
            "tokens_used": {
                "prompt": response.usage.prompt_tokens,
                "completion": response.usage.completion_tokens,
                "total": response.usage.total_tokens,
            },
            "review": review_data,
        }
    )


# ── Health check for this module ───────────────────────────────────────────────
@router.get("/health", include_in_schema=False)
async def health():
    return {"status": "ok", "module": "paper_review"}