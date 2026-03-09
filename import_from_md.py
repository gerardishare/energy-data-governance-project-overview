import json
from pathlib import Path
from typing import Any, Dict, List


ROOT = Path(__file__).parent


def _parse_header_block(lines: List[str]) -> Dict[str, str]:
    result: Dict[str, str] = {}
    for line in lines:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        result[key.strip()] = value.strip()
    return result


def _read_blocks(md_text: str) -> List[List[str]]:
    lines = md_text.splitlines()
    blocks: List[List[str]] = []
    current: List[str] = []
    for line in lines:
        if line.startswith("## id: "):
            if current:
                blocks.append(current)
            current = [line]
        else:
            if current or line.startswith("## id: "):
                current.append(line)
    if current:
        blocks.append(current)
    return blocks


def import_data_sharing(md_path: Path, json_path: Path) -> None:
    text = md_path.read_text(encoding="utf-8")
    blocks = _read_blocks(text)
    out_items: List[Dict[str, Any]] = []

    for block in blocks:
        header_lines: List[str] = []
        idx = 0
        while idx < len(block) and not block[idx].startswith("### "):
            header_lines.append(block[idx])
            idx += 1
        header = _parse_header_block(header_lines)
        item: Dict[str, Any] = {
            "id": header.get("id", ""),
            "naam": header.get("naam", ""),
            "status": header.get("status", ""),
            "scope": header.get("scope", ""),
            "geografische_scope": header.get("geografische_scope", ""),
            "eigenaar": header.get("eigenaar", ""),
            "jaar_start": json.loads(header.get("jaar_start", "null")),
            "jaar_einde": json.loads(header.get("jaar_einde", "null")),
        }
        tags_str = header.get("tags", "")
        if tags_str:
            item["tags"] = [t.strip() for t in tags_str.split(",") if t.strip()]
        else:
            item["tags"] = []

        # sections
        section: str | None = None
        buffer: List[str] = []
        sections: Dict[str, List[str]] = {}

        for line in block[idx:]:
            if line.startswith("### "):
                if section is not None:
                    sections[section] = buffer
                section = line[4:].strip()
                buffer = []
            else:
                if section is not None:
                    buffer.append(line)
        if section is not None:
            sections[section] = buffer

        def get_text(name: str) -> str:
            return "\n".join(sections.get(name, [])).strip()

        item["samenvatting"] = get_text("samenvatting")

        kr: Dict[str, Any] = {}
        kr["primair_doel"] = get_text("korte_referentie.primair_doel")
        res_lines = sections.get("korte_referentie.belangrijkste_resultaten", [])
        kr["belangrijkste_resultaten"] = [ln[2:].strip() for ln in res_lines if ln.strip().startswith("-")]
        user_lines = sections.get("korte_referentie.doelgebruikers", [])
        kr["doelgebruikers"] = [ln[2:].strip() for ln in user_lines if ln.strip().startswith("-")]
        item["korte_referentie"] = kr

        dev: Dict[str, Any] = {}
        dev["referentiedatum"] = get_text("ontwikkelingen_2023_2026.referentiedatum")
        dev["samenvatting"] = get_text("ontwikkelingen_2023_2026.samenvatting")
        hl_lines = sections.get("ontwikkelingen_2023_2026.hoogtepunten", [])
        highlights: List[Dict[str, Any]] = []
        for ln in hl_lines:
            ln = ln.strip()
            if not ln.startswith("-"):
                continue
            content = ln[1:].strip()
            parts = [p.strip() for p in content.split(";") if p.strip()]
            h: Dict[str, Any] = {}
            for part in parts:
                if "=" not in part:
                    continue
                k, v = part.split("=", 1)
                k = k.strip()
                v = v.strip()
                if k == "datum":
                    h["datum"] = v
                elif k == "titel":
                    h["titel"] = v
                elif k == "detail":
                    h["detail"] = v
            if h:
                highlights.append(h)
        dev["hoogtepunten"] = highlights
        item["ontwikkelingen_2023_2026"] = dev

        out_items.append(item)

    json_path.write_text(json.dumps(out_items, ensure_ascii=False, indent=2), encoding="utf-8")


def import_interoperability(md_path: Path, json_path: Path) -> None:
    original = json.loads(json_path.read_text(encoding="utf-8"))
    meta = original.get("meta") or {}

    text = md_path.read_text(encoding="utf-8")
    blocks = _read_blocks(text)
    initiatives: List[Dict[str, Any]] = []

    for block in blocks:
        header_lines: List[str] = []
        idx = 0
        while idx < len(block) and not block[idx].startswith("### "):
            header_lines.append(block[idx])
            idx += 1
        header = _parse_header_block(header_lines)

        section: str | None = None
        buffer: List[str] = []
        sections: Dict[str, List[str]] = {}
        for line in block[idx:]:
            if line.startswith("### "):
                if section is not None:
                    sections[section] = buffer
                section = line[4:].strip()
                buffer = []
            else:
                if section is not None:
                    buffer.append(line)
        if section is not None:
            sections[section] = buffer

        def get_text(name: str) -> str:
            return "\n".join(sections.get(name, [])).strip()

        it: Dict[str, Any] = {
            "id": header.get("id", ""),
            "naam": header.get("naam", ""),
            "familie": header.get("familie", ""),
            "geografische_scope": header.get("geografische_scope", ""),
            "status_2023": header.get("status_2023", ""),
            "status_2026": header.get("status_2026", ""),
            "korte_omschrijving": get_text("korte_omschrijving"),
            "ontwikkelingen_sinds_publicatie": get_text("ontwikkelingen_sinds_publicatie"),
            "bijdrage_datagovernance_interoperabiliteit": get_text("bijdrage_datagovernance_interoperabiliteit"),
            "relevantie_en_advies": get_text("relevantie_en_advies"),
            "verwante_of_nieuwe_initiatieven": get_text("verwante_of_nieuwe_initiatieven"),
        }

        br_lines = sections.get("bronnen", [])
        bronnen: List[str] = []
        for ln in br_lines:
            ln = ln.strip()
            if ln.startswith("-"):
                bronnen.append(ln[1:].strip())
        it["bronnen"] = bronnen

        initiatives.append(it)

    new_root = {"meta": meta, "initiatieven": initiatives}
    json_path.write_text(json.dumps(new_root, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    import_data_sharing(
        ROOT / "data" / "projects_data_sharing_2023.md",
        ROOT / "data" / "projects_data_sharing_2023.json",
    )
    import_data_sharing(
        ROOT / "data" / "projects_data_sharing_2026.md",
        ROOT / "data" / "projects_data_sharing_2026.json",
    )
    import_interoperability(
        ROOT / "data" / "projects_interoperability.md",
        ROOT / "data" / "projects_interoperability.json",
    )


if __name__ == "__main__":
    main()

