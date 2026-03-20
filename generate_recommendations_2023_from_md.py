import argparse
import json
import pathlib
import re

# Repository root = directory containing this script
_REPO_ROOT = pathlib.Path(__file__).resolve().parent
_DEFAULT_MD = _REPO_ROOT / "data" / "recommendations_2023.md"
_DEFAULT_JSON = _REPO_ROOT / "data" / "recommendations_2023.json"


def status_display_to_fields(display: str) -> tuple[str, str]:
    """Zet een statusregel uit Markdown (eventueel met emoji) om naar (statusKey, statusLabel)."""
    raw = (display or "").strip()
    if raw.startswith("✅"):
        label = raw.removeprefix("✅").strip() or "Gerealiseerd"
        return "realized", label
    if raw.startswith("🔶"):
        label = raw.removeprefix("🔶").strip() or "Gedeeltelijke voortgang"
        return "partial", label
    if raw.startswith("❌"):
        label = raw.removeprefix("❌").strip() or "Geen ontwikkeling"
        return "none", label
    low = raw.lower()
    if "geen ontwikkeling" in low:
        return "none", raw
    if "gedeeltelijk" in low:
        return "partial", raw
    if "gerealiseerd" in low:
        return "realized", raw
    return "none", raw


def parse_legend(lines: list[str]) -> list[dict]:
    start = None
    for i, l in enumerate(lines):
        if l.strip() == "## Statusindicatoren":
            start = i
            break
    if start is None:
        return []

    rows = []
    for j in range(start + 1, len(lines)):
        l = lines[j].rstrip("\n")
        if l.strip() == "---":
            break
        if not l.strip().startswith("|"):
            continue
        if "Status" in l and "Omschrijving" in l:
            continue

        # Example row: | ✅ Gerealiseerd | Aanbeveling is volledig uitgevoerd |
        parts = [p.strip() for p in l.strip().strip("|").split("|")]
        if len(parts) >= 2:
            status_cell = parts[0]
            desc = parts[1]
            if status_cell and desc and not (status_cell == "---" and desc == "---"):
                key, label = status_display_to_fields(status_cell)
                rows.append({"key": key, "label": label, "description": desc})
    return rows


def parse_recommendations(lines: list[str]) -> list[dict]:
    rec_starts = [i for i, l in enumerate(lines) if l.startswith("## Aanbeveling")]
    recs = []

    for idx, start in enumerate(rec_starts):
        end = rec_starts[idx + 1] if idx + 1 < len(rec_starts) else len(lines)
        block = lines[start:end]

        overall = ""
        for l in block:
            m = re.search(r"\*\*Hoofdstatus:\s*(.+?)\*\*", l)
            if m:
                overall = m.group(1).strip()
                break
            if "Hoofdstatus:" in l:
                overall = l.split("Hoofdstatus:", 1)[1].replace("**", "").strip()
                break

        # Example header: "Aanbeveling 1 — Ga aan de slag"
        header = block[0].replace("##", "", 1).strip()

        subs = []
        i = 0
        while i < len(block):
            l = block[i]
            if not l.startswith("### "):
                i += 1
                continue

            heading = l[len("### ") :].strip()
            sub_id = heading.split(" ", 1)[0]

            i += 1

            # Quote: blockquote lines starting with '>'
            while i < len(block) and not block[i].strip():
                i += 1
            quote_lines = []
            while i < len(block) and block[i].strip().startswith(">"):
                ql = block[i].strip()
                ql = re.sub(r"^>\s*", "", ql)
                quote_lines.append(ql)
                i += 1
            quote = "\n".join(quote_lines).strip()

            # Status line: "**Status: ...**"
            status_label = ""
            while i < len(block):
                if block[i].strip().startswith("**Status:"):
                    m = re.search(r"\*\*Status:\s*(.+?)\*\*", block[i])
                    if m:
                        status_label = m.group(1).strip()
                    else:
                        status_label = (
                            block[i].replace("**Status:", "").replace("**", "").strip()
                        )
                    i += 1
                    break
                i += 1

            # Move to "**Toelichting op de status**"
            while i < len(block) and "**Toelichting op de status**" not in block[i]:
                i += 1
            if i < len(block) and "**Toelichting op de status**" in block[i]:
                i += 1

            # Explanation until separator '---' or next heading
            expl_lines = []
            while i < len(block):
                if block[i].strip() == "---":
                    break
                if block[i].startswith("### ") or block[i].startswith("## "):
                    break
                expl_lines.append(block[i])
                i += 1

            explanation = "\n".join([x for x in expl_lines]).strip()

            sk, sl = status_display_to_fields(status_label)
            subs.append(
                {
                    "id": sub_id,
                    "title": heading,
                    "quote": quote,
                    "statusKey": sk,
                    "statusLabel": sl,
                    "statusExplanation": explanation,
                }
            )

            # Consume separator '---' if present
            while i < len(block) and block[i].strip() != "---" and not block[i].startswith("### "):
                i += 1
            if i < len(block) and block[i].strip() == "---":
                i += 1

        ok, ol = status_display_to_fields(overall)
        recs.append(
            {
                "id": str(idx + 1),
                "header": header,
                "overallStatusKey": ok,
                "overallStatusLabel": ol,
                "subRecommendations": subs,
            }
        )

    return recs


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Genereer data/recommendations_2023.json uit een Markdown-bron."
    )
    parser.add_argument(
        "md_file",
        nargs="?",
        type=pathlib.Path,
        default=_DEFAULT_MD,
        help=f"Pad naar de Markdown-bron (standaard: {_DEFAULT_MD.relative_to(_REPO_ROOT)})",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=pathlib.Path,
        default=_DEFAULT_JSON,
        help=f"Uitvoer-JSON (standaard: {_DEFAULT_JSON.relative_to(_REPO_ROOT)})",
    )
    args = parser.parse_args()
    md_path = args.md_file.expanduser().resolve()
    out_path = args.output.expanduser().resolve()

    if not md_path.is_file():
        raise SystemExit(
            f"Bronbestand ontbreekt: {md_path}\n"
            f"Plaats het Markdown-bestand op die locatie, of geef een pad mee:\n"
            f"  python {pathlib.Path(__file__).name} pad/naar/bron.md"
        )

    md_text = md_path.read_text(encoding="utf-8")
    lines = md_text.splitlines()

    data = {
        "legend": parse_legend(lines),
        "recommendations": parse_recommendations(lines),
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path}")
    print(f"legend rows: {len(data['legend'])}")
    print(f"recommendations: {len(data['recommendations'])}")
    print(f"subs per rec: {[len(r['subRecommendations']) for r in data['recommendations']]}")


if __name__ == "__main__":
    main()

