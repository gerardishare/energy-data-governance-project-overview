import argparse
import json
from pathlib import Path
from typing import Any, Callable, Dict, List, Tuple


ROOT = Path(__file__).parent

ExportFn = Callable[[Path, Path], None]


def _join_non_empty(lines: List[str]) -> str:
    return "\n".join([ln.rstrip() for ln in lines]).strip()


def export_data_sharing(json_path: Path, md_path: Path) -> None:
    data = json.loads(json_path.read_text(encoding="utf-8"))
    assert isinstance(data, list)

    lines: List[str] = []
    lines.append(f"# Export van {json_path.name}")
    lines.append("")

    for item in data:
        i: Dict[str, Any] = item
        lines.append(f"## id: {i.get('id','').strip()}")
        lines.append(f"naam: {i.get('naam','')}")
        lines.append(f"status: {i.get('status','')}")
        lines.append(f"scope: {i.get('scope','')}")
        lines.append(f"geografische_scope: {i.get('geografische_scope','')}")
        lines.append(f"eigenaar: {i.get('eigenaar','')}")
        lines.append(f"jaar_start: {i.get('jaar_start')}")
        lines.append(f"jaar_einde: {i.get('jaar_einde')}")

        tags = i.get("tags") or []
        if isinstance(tags, list):
            lines.append("tags: " + ", ".join(str(t) for t in tags))
        else:
            lines.append("tags:")

        lines.append("")
        lines.append("### links")
        for L in i.get("links") or []:
            if not isinstance(L, dict):
                continue
            label = str(L.get("label", "")).strip()
            url = str(L.get("url", "")).strip()
            if not url:
                continue
            parts: List[str] = []
            if label:
                parts.append(f"label={label}")
            parts.append(f"url={url}")
            lines.append("- " + "; ".join(parts))
        lines.append("")

        lines.append("### samenvatting")
        lines.append(i.get("samenvatting", "").rstrip())
        lines.append("")

        kr: Dict[str, Any] = i.get("korte_referentie") or {}
        lines.append("### korte_referentie.primair_doel")
        lines.append(str(kr.get("primair_doel", "")).rstrip())
        lines.append("")

        lines.append("### korte_referentie.belangrijkste_resultaten")
        for res in kr.get("belangrijkste_resultaten") or []:
            lines.append(f"- {res}")
        lines.append("")

        lines.append("### korte_referentie.doelgebruikers")
        for user in kr.get("doelgebruikers") or []:
            lines.append(f"- {user}")
        lines.append("")

        dev: Dict[str, Any] = i.get("ontwikkelingen_2023_2026") or {}
        lines.append("### ontwikkelingen_2023_2026.referentiedatum")
        lines.append(str(dev.get("referentiedatum", "")).rstrip())
        lines.append("")

        lines.append("### ontwikkelingen_2023_2026.samenvatting")
        lines.append(str(dev.get("samenvatting", "")).rstrip())
        lines.append("")

        lines.append("### ontwikkelingen_2023_2026.hoogtepunten")
        for h in dev.get("hoogtepunten") or []:
            datum = h.get("datum", "")
            titel = h.get("titel", "")
            detail = h.get("detail", "")
            parts = []
            if datum:
                parts.append(f"datum={datum}")
            if titel:
                parts.append(f"titel={titel}")
            if detail:
                parts.append(f"detail={detail}")
            if parts:
                lines.append("- " + "; ".join(parts))
        lines.append("")

    md_path.write_text(_join_non_empty(lines) + "\n", encoding="utf-8")


def export_interoperability(json_path: Path, md_path: Path) -> None:
    root = json.loads(json_path.read_text(encoding="utf-8"))
    initiatives = root.get("initiatieven") or []

    lines: List[str] = []
    lines.append(f"# Export van {json_path.name}")
    lines.append("")

    for it in initiatives:
        i: Dict[str, Any] = it
        lines.append(f"## id: {i.get('id','').strip()}")
        lines.append(f"naam: {i.get('naam','')}")
        lines.append(f"familie: {i.get('familie','')}")
        lines.append(f"geografische_scope: {i.get('geografische_scope','')}")
        lines.append(f"status_2023: {i.get('status_2023','')}")
        lines.append(f"status_2026: {i.get('status_2026','')}")
        lines.append("")

        lines.append("### korte_omschrijving")
        lines.append(i.get("korte_omschrijving", "").rstrip())
        lines.append("")

        lines.append("### ontwikkelingen_sinds_publicatie")
        lines.append(i.get("ontwikkelingen_sinds_publicatie", "").rstrip())
        lines.append("")

        lines.append("### bijdrage_datagovernance_interoperabiliteit")
        lines.append(i.get("bijdrage_datagovernance_interoperabiliteit", "").rstrip())
        lines.append("")

        lines.append("### relevantie_en_advies")
        lines.append(i.get("relevantie_en_advies", "").rstrip())
        lines.append("")

        lines.append("### verwante_of_nieuwe_initiatieven")
        lines.append(i.get("verwante_of_nieuwe_initiatieven", "").rstrip())
        lines.append("")

        lines.append("### bronnen")
        for b in i.get("bronnen") or []:
            lines.append(f"- {b}")
        lines.append("")

    md_path.write_text(_join_non_empty(lines) + "\n", encoding="utf-8")


def export_recommendations_2023(json_path: Path, md_path: Path) -> None:
    root = json.loads(json_path.read_text(encoding="utf-8"))
    legend = root.get("legend") or []
    recommendations = root.get("recommendations") or []

    lines: List[str] = []
    lines.append(f"# Export van {json_path.name}")
    lines.append("")
    lines.append("## id: __legend__")
    lines.append("")
    for leg in legend:
        lk: str = str((leg or {}).get("key", "")).strip()
        if not lk:
            continue
        lines.append(f"### legend.{lk}.label")
        lines.append(str((leg or {}).get("label", "")).rstrip())
        lines.append("")
        lines.append(f"### legend.{lk}.description")
        lines.append(str((leg or {}).get("description", "")).rstrip())
        lines.append("")

    for rec in recommendations:
        r: Dict[str, Any] = rec or {}
        lines.append(f"## id: {r.get('id', '').strip()}")
        lines.append(f"header: {r.get('header', '')}")
        lines.append(f"overallStatusKey: {r.get('overallStatusKey', '')}")
        lines.append(f"overallStatusLabel: {r.get('overallStatusLabel', '')}")
        lines.append("")
        for sub in r.get("subRecommendations") or []:
            s: Dict[str, Any] = sub or {}
            sid = str(s.get("id", "")).strip()
            if not sid:
                continue
            p = f"sub.{sid}."
            lines.append(f"### {p}title")
            lines.append(str(s.get("title", "")).rstrip())
            lines.append("")
            lines.append(f"### {p}quote")
            lines.append(str(s.get("quote", "")).rstrip())
            lines.append("")
            lines.append(f"### {p}statusExplanation")
            lines.append(str(s.get("statusExplanation", "")).rstrip())
            lines.append("")
            lines.append(f"### {p}statusKey")
            lines.append(str(s.get("statusKey", "")).rstrip())
            lines.append("")
            lines.append(f"### {p}statusLabel")
            lines.append(str(s.get("statusLabel", "")).rstrip())
            lines.append("")

    md_path.write_text(_join_non_empty(lines) + "\n", encoding="utf-8")


def main() -> None:
    jobs: Dict[str, Tuple[ExportFn, Path, Path]] = {
        "data_sharing_2023": (
            export_data_sharing,
            ROOT / "data" / "projects_data_sharing_2023.json",
            ROOT / "data" / "projects_data_sharing_2023.md",
        ),
        "data_sharing_2026": (
            export_data_sharing,
            ROOT / "data" / "projects_data_sharing_2026.json",
            ROOT / "data" / "projects_data_sharing_2026.md",
        ),
        "interoperability": (
            export_interoperability,
            ROOT / "data" / "projects_interoperability.json",
            ROOT / "data" / "projects_interoperability.md",
        ),
        "recommendations_2023": (
            export_recommendations_2023,
            ROOT / "data" / "recommendations_2023.json",
            ROOT / "data" / "recommendations_2023.md",
        ),
    }
    order = list(jobs.keys())
    parser = argparse.ArgumentParser(
        description="Write Markdown snapshots from JSON under data/ (for diff-friendly editing)."
    )
    parser.add_argument(
        "--source",
        action="append",
        choices=order,
        metavar="NAME",
        dest="sources",
        help=(
            "Dataset to export (repeat for several). "
            f"Choices: {', '.join(order)}. Default: all."
        ),
    )
    args = parser.parse_args()
    selected = args.sources if args.sources else order
    for name in selected:
        fn, json_path, md_path = jobs[name]
        fn(json_path, md_path)


if __name__ == "__main__":
    main()

