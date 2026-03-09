# Export van projects_interoperability.json

## id: energiewet_nl
naam: Energiewet (NL) – begrippen, rollen en randvoorwaarden voor gegevensbeheer
familie: Juridisch kader / definities
geografische_scope: Nederland
status_2023: Wetgevingsproces lopend; kader in wording voor rollen/registraties en gegevensuitwisseling.
status_2026: In werking (per 1 januari 2026); normerend begrippenkader en basis voor governance rond energiedata.

### korte_omschrijving
Normerend wettelijk kader dat kernbegrippen en rollen definieert en randvoorwaarden stelt voor gegevensbeheer en gegevensuitwisseling in het energiedomein.

### ontwikkelingen_sinds_publicatie
Inwerkingtreding en verdere concretisering in implementatiepraktijk (rollen, processen, registraties).

### bijdrage_datagovernance_interoperabiliteit
Verankert verantwoordelijkheden/rechten/plichten; stimuleert eenduidige begripsvorming en afdwingbaarheid van afspraken.

### relevantie_en_advies
Zeer relevant; opnemen als normerend fundament en koppelen aan semantische standaarden.

### verwante_of_nieuwe_initiatieven
VIVET/Geonovum Begrippenkader; CIM/CGMES; NBility.

### bronnen
- FILE_RATHENAU_PARL
- FILE_RAPPORT_HOOFD
- FILE_BIJLAGEN_6_1

## id: vivet_begrippenkader
naam: VIVET/Geonovum – Begrippenkader Energie
familie: Begrippenkader / semantische governance
geografische_scope: Nederland
status_2023: In doorontwikkeling; positionering als online begrippenkader voor energiedata.
status_2026: Bredere inzet als centrale referentie; belang toegenomen door groei aan modellen en ketenintegraties.

### korte_omschrijving
Begrippenkader met definities en relaties tussen energieconcepten; bedoeld als referentie voor semantische afstemming en beheer.

### ontwikkelingen_sinds_publicatie
Meer nadruk op beheer (governance), hergebruik en mapping naar informatiemodellen.

### bijdrage_datagovernance_interoperabiliteit
Ondersteunt semantische governance (terminologiebeheer, definities); maakt model-alignments beheersbaar.

### relevantie_en_advies
Kerninitiatief; behouden en expliciet verbinden met informatiemodellen en ketenafspraken.

### verwante_of_nieuwe_initiatieven
LinkED/MHM (harmonisatie); ESDL; NBility; CIM-profielen.

### bronnen
- FILE_BIJLAGEN_6_1
- FILE_UPDATE_H61

## id: cim_cgmes
naam: CIM / CGMES (IEC 61970/61968 + ENTSO-E profiel)
familie: Semantische standaard (netten)
geografische_scope: Europa/Nederland
status_2023: Breed ingezet (TSO/DSO); conformance en profielen actief; CGMES als standaard voor grid model exchange.
status_2026: Doorlopende updates; conformance/SV-IOP tests volwassen; ruggengraat voor netmodel-interoperabiliteit.

### korte_omschrijving
IEC Common Information Model (CIM) en ENTSO-E CGMES-profiel voor uitwisseling van net- en gridmodellen.

### ontwikkelingen_sinds_publicatie
ENTSO-E introduceerde jaarlijkse SV-IOP; 2024 testreport publiek met governance rond NC profiles.

### bijdrage_datagovernance_interoperabiliteit
Levert gedeelde semantiek + syntaxis én conformance governance via profielen, tests en change management.

### relevantie_en_advies
Kern; expliciet positioneren als authoritative semantiek voor netwerkdata.

### verwante_of_nieuwe_initiatieven
ENTSO-E CGMES Library; ENTSO-E CIM Conformity & Interoperability; OneNet; INT:NET/IOP.

### bronnen
- WEB_ENTSOE_CGMES
- WEB_ENTSOE_SVIOP_2024
- WEB_ZENODO_SVIOP_2024
- WEB_INTNET_IOP_PDF

## id: esdl
naam: ESDL (Energy System Description Language)
familie: Semantisch model (energiesysteem, multi-vector)
geografische_scope: Nederland/Europa
status_2023: Groeiend toegepast in NL energiesysteem-analyse; tooling/community in opbouw.
status_2026: Breed toegepast; geschikt als koppeltaal voor integrale systeemrepresentaties en scenario-uitwisseling.

### korte_omschrijving
Modeltaal om energiesystemen (elektra, warmte, gas) integraal te beschrijven; gebruikt in systeemstudies en scenario’s.

### ontwikkelingen_sinds_publicatie
Meer nadruk op hergebruik, repositories en mapping naar andere standaarden.

### bijdrage_datagovernance_interoperabiliteit
Biedt gedeelde semantiek voor integrale energiesystemen; maakt aannames/datasets transparanter.

### relevantie_en_advies
Kern; behouden en expliciet koppelen aan CIM/SAREF/asset-identificatie via mappings.

### verwante_of_nieuwe_initiatieven
OEO; LinkED/MHM; InterConnect (voor gebouw/IoT-koppelingen).

### bronnen
- FILE_UPDATE_H61
- FILE_BIJLAGEN_6_1

## id: saref
naam: ETSI SAREF
familie: Ontologie (IoT/gebouw/achter-de-meter)
geografische_scope: Europa
status_2023: EU-referentieontologie; relevant voor achter-de-meter en smart building use-cases.
status_2026: Suite actief doorontwikkeld; belangrijker door koppelingen tussen gebouw/energie-data en semantische frameworks.

### korte_omschrijving
Suite van ontologieën voor slimme apparaten/IoT met extensies; inzetbaar voor device/sensor semantiek en mapping naar energiedomein.

### ontwikkelingen_sinds_publicatie
Doorlopende updates via ETSI; meer praktijktesten in projecten (o.a. InterConnect).

### bijdrage_datagovernance_interoperabiliteit
Biedt gedeelde begrippen voor device/sensor data; faciliteert mapping naar domeinmodellen.

### relevantie_en_advies
Belangrijk maar afgebakend: inzetten waar IoT/gebouwdata onderdeel is van energiedata.

### verwante_of_nieuwe_initiatieven
InterConnect SIF; LF Energy SEF.

### bronnen
- WEB_SAREF_PORTAL
- WEB_INTERCONNECT_D23
- WEB_LFENERGY_SEF

## id: interconnect_sif
naam: InterConnect – ontologieën & Semantic Interoperability Framework (SIF)
familie: EU project (ontologie/semantiek)
geografische_scope: Europa
status_2023: Project actief; publieke deliverable D2.3 over standards and ontologies beschikbaar (2023).
status_2026: Project afgerond; resultaten gecontinueerd richting LF Energy SEF (open governance).

### korte_omschrijving
H2020 InterConnect (2019–2024) ontwikkelde ontologieën en een semantic interoperability framework (SIF) voor smart home/building/grid/IoT use-cases.

### ontwikkelingen_sinds_publicatie
Consolidatie van SIF-resultaten en transitie naar open source/industry governance.

### bijdrage_datagovernance_interoperabiliteit
Levert herbruikbare ontologieën, methoden en specificaties voor semantische interoperabiliteit tussen services en databronnen.

### relevantie_en_advies
Zeer relevant als EU-best practice; toepassen voor gebouw/IoT ↔ energie koppelingen en als methodebron.

### verwante_of_nieuwe_initiatieven
LF Energy SEF; ETSI SAREF; EDSO DSOi paper (SIF integratie).

### bronnen
- WEB_INTERCONNECT_D23
- WEB_LFENERGY_SEF
- WEB_EDSO_DSOI_PAPER

## id: lfenergy_sef
naam: LF Energy – Semantic Energy Framework (SEF)
familie: Open source semantic framework
geografische_scope: Europa/Internationaal
status_2023: SEF nog niet zichtbaar als apart LF Energy project; SIF in InterConnect in ontwikkeling.
status_2026: SEF actief als LF Energy project; positioneert SIF-resultaten als herbruikbaar framework.

### korte_omschrijving
LF Energy project dat voortbouwt op InterConnect SIF en tools/methods/specs voor semantische interoperabiliteit consolideert onder open governance.

### ontwikkelingen_sinds_publicatie
Start/opschaling als open governance laag voor semantische assets.

### bijdrage_datagovernance_interoperabiliteit
Ondersteunt beheer, versiebeheer en hergebruik van semantische assets (ontologieën, mappings, guidelines).

### relevantie_en_advies
Relevant; opnemen als mogelijke landing place voor semantische assets en alignment.

### verwante_of_nieuwe_initiatieven
InterConnect SIF; ETSI SAREF.

### bronnen
- WEB_LFENERGY_SEF
- WEB_INTERCONNECT_D23

## id: onenet_interop
naam: OneNet – interoperabiliteitsrichtlijnen en dataspecificaties
familie: EU project (interoperabiliteit richtlijnen/specs)
geografische_scope: Europa
status_2023: Project actief; deliverables gepubliceerd.
status_2026: Projectresultaten publiek; bruikbaar als referentie/benchmark.

### korte_omschrijving
OneNet publiceerde richtlijnen en deliverables voor interoperabiliteit, incl. technische specs voor data models/middleware (o.a. D5.5).

### ontwikkelingen_sinds_publicatie
Van deliverables naar replicability/lessons learned; CIM/CGMES blijft centraal.

### bijdrage_datagovernance_interoperabiliteit
Analyse en aanbevelingen voor interoperabiliteit; concrete technische specs voor data models/middleware (D5.5).

### relevantie_en_advies
Relevant als Europese referentie; koppelen aan CIM/CGMES en nationale ketens.

### verwante_of_nieuwe_initiatieven
ENTSO-E SV-IOP; CIM/CGMES; optioneel Smart Data Models/NGSI-LD bij FIWARE-keuze.

### bronnen
- WEB_ONENET_DELIVERABLES
- WEB_ONENET_ZENODO_D55
