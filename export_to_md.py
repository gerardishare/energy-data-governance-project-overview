import json
from pathlib import Path
from typing import Any, Dict, List


ROOT = Path(__file__).parent


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


def main() -> None:
    export_data_sharing(
        ROOT / "data" / "projects_data_sharing_2023.json",
        ROOT / "data" / "projects_data_sharing_2023.md",
    )
    export_data_sharing(
        ROOT / "data" / "projects_data_sharing_2026.json",
        ROOT / "data" / "projects_data_sharing_2026.md",
    )
    export_interoperability(
        ROOT / "data" / "projects_interoperability.json",
        ROOT / "data" / "projects_interoperability.md",
    )


if __name__ == "__main__":
    main()

