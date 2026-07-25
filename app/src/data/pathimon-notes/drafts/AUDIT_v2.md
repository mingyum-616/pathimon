# AUDIT_v2 — 59종 노트 일괄 감사 (WORKFLOW §4-3)

대상 131개 노트 (drafts/ 전체 + 루트 2건). 그중 `NAME_SELECTIONS.json` 선정 **59종**이 실제 빌드된다(`data/pathimonNoteData.ts:120`).
기준: `claudecode/VOCAB.md`(어휘) · `claudecode/STATS.md`(밴드) · `claudecode/TEMPLATE-v2.md`(스키마).
**읽기 전용 감사 — 노트/코드 무수정. 수치만 제시하고 개정은 하지 않는다.**

## 요약

| # | 항목 | 위반 노트 | 그중 선정 59종 |
|---|---|---:|---:|
| 1 | 타입이 VOCAB §1 6종 밖 | 46 | 31 |
| 2 | VOCAB 미등재 어휘 사용 (미등재 값 248종) | 131 | 59 |
| 3 | 빈 필드 존재 | 131 | 59 |
| 4 | learnText 게임 용어 오염 | 107 | 37 |
| 5 | 3축 합계 120~250 이탈 | 12 | 2 |
| 6 | 출처 강의 공란 | 74 | 2 |

설계검토 블록 잔존 131 / 메모 블록 잔존 131 / 학습포인트 보유 0 / evasion 태그 보유 0 / 진화 블록 보유 0

## 1. 타입 일탈 (VOCAB §1)

| 쓰인 값 | 노트 수 | v2 조치 |
|---|---:|---|
| 선충 | 23 | `타입: 기생충` + `structure: 선충` |
| 흡충 | 10 | `타입: 기생충` + `structure: 흡충` |
| 세균 병원형 | 7 | 판정 필요 |
| 조충 | 4 | `타입: 기생충` + `structure: 조충` |
| 세균 내성형 | 2 | 판정 필요 |

<details><summary>노트 목록</summary>

- **29** `drafts/bacteria/CRE.md:5` — `타입: 세균 내성형`
- **14** `drafts/bacteria/EAEC.md:5` — `타입: 세균 병원형`
- **15** `drafts/bacteria/EHEC_STEC E. coli O157_H7.md:5` — `타입: 세균 병원형`
- **16** `drafts/bacteria/EIEC.md:5` — `타입: 세균 병원형`
- **13** `drafts/bacteria/EPEC.md:5` — `타입: 세균 병원형`
- **12** `drafts/bacteria/ETEC.md:5` — `타입: 세균 병원형`
- **28** `drafts/bacteria/Hypervirulent Klebsiella pneumoniae.md:5` — `타입: 세균 병원형`
- **17** `drafts/bacteria/UPEC.md:5` — `타입: 세균 병원형`
- — `drafts/bacteria/VRE.md:5` — `타입: 세균 내성형`
- — `drafts/cestode/Hymenolepis nana.md:5` — `타입: 조충`
- **53** `drafts/cestode/Sparganum Spirometra spp.md:5` — `타입: 조충`
- — `drafts/cestode/Taenia saginata.md:5` — `타입: 조충`
- **54** `drafts/cestode/Taenia solium.md:5` — `타입: 조충`
- **40** `drafts/nematode/Ancylostoma duodenale.md:5` — `타입: 선충`
- — `drafts/nematode/Angiostrongylus cantonensis.md:5` — `타입: 선충`
- **33** `drafts/nematode/Anisakis simplex.md:5` — `타입: 선충`
- **32** `drafts/nematode/Ascaris lumbricoides.md:5` — `타입: 선충`
- **44** `drafts/nematode/Brugia malayi.md:5` — `타입: 선충`
- — `drafts/nematode/Brugia timori.md:5` — `타입: 선충`
- **36** `drafts/nematode/Capillaria hepatica.md:5` — `타입: 선충`
- **37** `drafts/nematode/Capillaria philippinensis.md:5` — `타입: 선충`
- — `drafts/nematode/Dirofilaria immitis.md:5` — `타입: 선충`
- **48** `drafts/nematode/Dracunculus medinensis.md:5` — `타입: 선충`
- **42** `drafts/nematode/Enterobius vermicularis.md:5` — `타입: 선충`
- — `drafts/nematode/Gnathostoma spp.md:5` — `타입: 선충`
- **46** `drafts/nematode/Loa loa.md:5` — `타입: 선충`
- — `drafts/nematode/Mansonella spp.md:5` — `타입: 선충`
- **41** `drafts/nematode/Necator americanus.md:5` — `타입: 선충`
- **45** `drafts/nematode/Onchocerca volvulus.md:5` — `타입: 선충`
- **39** `drafts/nematode/Strongyloides stercoralis.md:5` — `타입: 선충`
- **47** `drafts/nematode/Thelazia callipaeda.md:5` — `타입: 선충`
- **34** `drafts/nematode/Toxocara canis.md:5` — `타입: 선충`
- — `drafts/nematode/Toxocara cati.md:5` — `타입: 선충`
- **38** `drafts/nematode/Trichinella spiralis.md:5` — `타입: 선충`
- **35** `drafts/nematode/Trichuris trichiura.md:5` — `타입: 선충`
- **43** `drafts/nematode/Wuchereria bancrofti.md:5` — `타입: 선충`
- — `drafts/trematode/Alaria.md:5` — `타입: 흡충`
- **49** `drafts/trematode/Clonorchis sinensis.md:5` — `타입: 흡충`
- — `drafts/trematode/Echinostoma.md:5` — `타입: 흡충`
- — `drafts/trematode/Fasciola gigantica.md:5` — `타입: 흡충`
- **50** `drafts/trematode/Fasciola hepatica.md:5` — `타입: 흡충`
- — `drafts/trematode/Heterophyes.md:5` — `타입: 흡충`
- — `drafts/trematode/Metagonimus.md:5` — `타입: 흡충`
- — `drafts/trematode/Opisthorchis spp.md:5` — `타입: 흡충`
- **51** `drafts/trematode/Paragonimus westermani.md:5` — `타입: 흡충`
- **52** `drafts/trematode/Schistosoma spp.md:5` — `타입: 흡충`

</details>

## 2. VOCAB 미등재 어휘 (값별 빈도)

### 2-1. structure (VOCAB §2-1)

| 값 | 사용 | 위치 |
|---|---:|---|
| `사상충` | 7 | `drafts/nematode/Brugia malayi.md:7`, `drafts/nematode/Brugia timori.md:7`, `drafts/nematode/Dirofilaria immitis.md:7` 외 4 |
| `RNA` | 7 | `drafts/virus/Influenza virus.md:7`, `drafts/virus/LCMV.md:7`, `drafts/virus/Measles.md:7` 외 4 |
| `비외피` | 4 | `drafts/virus/Adenovirus.md:7`, `drafts/virus/Norovirus.md:7`, `drafts/virus/Poliovirus.md:7` 외 1 |
| `아포` | 4 | `drafts/bacteria/Clostridioides difficile.md:7`, `drafts/bacteria/Clostridium botulinum.md:7`, `drafts/bacteria/Clostridium perfringens.md:7` 외 1 |
| `DNA` | 4 | `drafts/virus/Adenovirus.md:7`, `drafts/virus/EBV.md:7`, `drafts/virus/HCMV.md:7` 외 1 |
| `그람음성유사` | 3 | `drafts/bacteria/Chlamydia spp.md:7`, `drafts/bacteria/Chlamydia trachomatis.md:7`, `drafts/bacteria/Rickettsia spp.md:7` |
| `만곡막대` | 3 | `drafts/bacteria/Vibrio cholerae.md:7`, `drafts/bacteria/Vibrio parahaemolyticus.md:7`, `drafts/bacteria/Vibrio vulnificus.md:7` |
| `무세포벽` | 3 | `drafts/bacteria/Mycoplasma hominis.md:7`, `drafts/bacteria/Mycoplasma spp.md:7`, `drafts/bacteria/Ureaplasma urealyticum.md:7` |
| `원충` | 3 | `drafts/protozoa/Leishmania spp.md:7`, `drafts/protozoa/Plasmodium spp.md:7`, `drafts/protozoa/Toxoplasma gondii.md:7` |
| `절대세포내` | 3 | `drafts/bacteria/Chlamydia spp.md:7`, `drafts/bacteria/Chlamydia trachomatis.md:7`, `drafts/bacteria/Rickettsia spp.md:7` |
| `헤르페스바이러스` | 3 | `drafts/virus/EBV.md:7`, `drafts/virus/HCMV.md:7`, `drafts/virus/HSV.md:7` |
| `구충` | 2 | `drafts/nematode/Ancylostoma duodenale.md:7`, `drafts/nematode/Necator americanus.md:7` |
| `그람음성쌍알균` | 2 | `drafts/bacteria/Neisseria gonorrhoeae.md:7`, `drafts/bacteria/Neisseria meningitidis.md:7` |
| `나선형` | 2 | `drafts/bacteria/Campylobacter jejuni.md:7`, `drafts/bacteria/Helicobacter pylori.md:7` |
| `미세사상충` | 2 | `drafts/nematode/Brugia timori.md:7`, `drafts/nematode/Mansonella spp.md:7` |
| `분절유전체` | 2 | `drafts/virus/Influenza virus.md:7`, `drafts/virus/Rotavirus.md:7` |
| `소구간균` | 2 | `drafts/bacteria/Bordetella pertussis.md:7`, `drafts/bacteria/Haemophilus influenzae.md:7` |
| `소형장흡충` | 2 | `drafts/trematode/Heterophyes.md:7`, `drafts/trematode/Metagonimus.md:7` |
| `스피로헤타` | 2 | `drafts/bacteria/Borrelia burgdorferi.md:7`, `drafts/bacteria/Treponema pallidum.md:7` |
| `간질` | 1 | `drafts/trematode/Fasciola gigantica.md:7` |
| `격벽균사` | 1 | `drafts/fungus/Aspergillus fumigatus.md:7` |
| `균사형전환` | 1 | `drafts/fungus/Candida albicans.md:7` |
| `그람가변성` | 1 | `drafts/bacteria/Gardnerella vaginalis.md:7` |
| `내성형` | 1 | `drafts/bacteria/VRE.md:7` |
| `담관기생` | 1 | `drafts/trematode/Opisthorchis spp.md:7` |
| `두관극` | 1 | `drafts/trematode/Echinostoma.md:7` |
| `무구두절` | 1 | `drafts/cestode/Taenia saginata.md:7` |
| `분생포자` | 1 | `drafts/fungus/Aspergillus fumigatus.md:7` |
| `소형조충` | 1 | `drafts/cestode/Hymenolepis nana.md:7` |
| `심장사상충` | 1 | `drafts/nematode/Dirofilaria immitis.md:7` |
| `쌍알균` | 1 | `drafts/bacteria/Moraxella catarrhalis.md:7` |
| `아레나바이러스` | 1 | `drafts/virus/LCMV.md:7` |
| `아메바` | 1 | `drafts/protozoa/Entamoeba histolytica.md:7` |
| `약항산성` | 1 | `drafts/bacteria/Nocardia spp.md:7` |
| `유충-성충` | 1 | `drafts/nematode/Trichinella spiralis.md:7` |
| `유충이행` | 1 | `drafts/nematode/Toxocara cati.md:7` |
| `이동유충` | 1 | `drafts/nematode/Gnathostoma spp.md:7` |
| `잎모양흡충` | 1 | `drafts/trematode/Fasciola gigantica.md:7` |
| `장흡충` | 1 | `drafts/trematode/Echinostoma.md:7` |
| `적혈구내` | 1 | `drafts/protozoa/Plasmodium spp.md:7` |
| `정이십면체` | 1 | `drafts/virus/Adenovirus.md:7` |
| `조직낭종` | 1 | `drafts/protozoa/Toxoplasma gondii.md:7` |
| `조충유충` | 1 | `drafts/cestode/Sparganum Spirometra spp.md:7` |
| `쥐폐선충` | 1 | `drafts/nematode/Angiostrongylus cantonensis.md:7` |
| `직접생활사` | 1 | `drafts/cestode/Hymenolepis nana.md:7` |
| `칼리시바이러스` | 1 | `drafts/virus/Norovirus.md:7` |
| `코로나바이러스` | 1 | `drafts/virus/SARS-CoV-2.md:7` |
| `탄환형` | 1 | `drafts/virus/Rabies.md:7` |
| `파라믹소바이러스` | 1 | `drafts/virus/Measles.md:7` |
| `편모형-무편모형` | 1 | `drafts/protozoa/Leishmania spp.md:7` |
| `포낭-영양형` | 1 | `drafts/protozoa/Entamoeba histolytica.md:7` |
| `피코르나바이러스` | 1 | `drafts/virus/Poliovirus.md:7` |
| `효모` | 1 | `drafts/fungus/Candida albicans.md:7` |
| `dsRNA` | 1 | `drafts/virus/Rotavirus.md:7` |
| `HAV` | 1 | `drafts/virus/Hepatitis viruses.md:7` |
| `HBV` | 1 | `drafts/virus/Hepatitis viruses.md:7` |
| `HCV` | 1 | `drafts/virus/Hepatitis viruses.md:7` |
| `HDV` | 1 | `drafts/virus/Hepatitis viruses.md:7` |
| `HEV` | 1 | `drafts/virus/Hepatitis viruses.md:7` |
| `mesocercaria` | 1 | `drafts/trematode/Alaria.md:7` |

### 2-2. location (VOCAB §2-2)

| 값 | 사용 | 위치 |
|---|---:|---|
| `피부` | 10 | `drafts/bacteria/Borrelia burgdorferi.md:8`, `drafts/bacteria/Staphylococcus epidermidis.md:8`, `drafts/fungus/Candida albicans.md:8` 외 7 |
| `소장` | 9 | `drafts/bacteria/Vibrio cholerae.md:8`, `drafts/bacteria/Vibrio parahaemolyticus.md:8`, `drafts/cestode/Hymenolepis nana.md:8` 외 6 |
| `호흡기` | 7 | `drafts/bacteria/Haemophilus influenzae.md:8`, `drafts/bacteria/Pseudomonas aeruginosa.md:8`, `drafts/fungus/Aspergillus fumigatus.md:8` 외 4 |
| `중추신경계` | 5 | `drafts/nematode/Angiostrongylus cantonensis.md:8`, `drafts/nematode/Gnathostoma spp.md:8`, `drafts/protozoa/Toxoplasma gondii.md:8` 외 2 |
| `점막` | 4 | `drafts/bacteria/Neisseria gonorrhoeae.md:8`, `drafts/bacteria/Treponema pallidum.md:8`, `drafts/fungus/Candida albicans.md:8` 외 1 |
| `간실질` | 3 | `drafts/nematode/Capillaria hepatica.md:8`, `drafts/trematode/Fasciola gigantica.md:8`, `drafts/trematode/Fasciola hepatica.md:8` |
| `림프관` | 3 | `drafts/nematode/Brugia malayi.md:8`, `drafts/nematode/Brugia timori.md:8`, `drafts/nematode/Wuchereria bancrofti.md:8` |
| `림프절` | 3 | `drafts/bacteria/Mycobacterium bovis.md:8`, `drafts/bacteria/Yersinia enterocolitica.md:8`, `drafts/nematode/Wuchereria bancrofti.md:8` |
| `피하조직` | 3 | `drafts/cestode/Sparganum Spirometra spp.md:8`, `drafts/nematode/Dracunculus medinensis.md:8`, `drafts/nematode/Loa loa.md:8` |
| `간세포` | 2 | `drafts/protozoa/Plasmodium spp.md:8`, `drafts/virus/Hepatitis viruses.md:8` |
| `결막` | 2 | `drafts/nematode/Loa loa.md:8`, `drafts/virus/Adenovirus.md:8` |
| `대식세포내` | 2 | `drafts/bacteria/Legionella pneumophila.md:8`, `drafts/protozoa/Leishmania spp.md:8` |
| `대장` | 2 | `drafts/nematode/Trichuris trichiura.md:8`, `drafts/protozoa/Entamoeba histolytica.md:8` |
| `말초신경` | 2 | `drafts/bacteria/Mycobacterium leprae.md:8`, `drafts/virus/Rabies.md:8` |
| `맹장` | 2 | `drafts/nematode/Enterobius vermicularis.md:8`, `drafts/nematode/Trichuris trichiura.md:8` |
| `병원내환경` | 2 | `drafts/bacteria/Enterococcus faecium.md:8`, `drafts/bacteria/VRE.md:8` |
| `생식기` | 2 | `drafts/bacteria/Neisseria gonorrhoeae.md:8`, `drafts/bacteria/Streptococcus agalactiae.md:8` |
| `세포내봉입체` | 2 | `drafts/bacteria/Chlamydia spp.md:8`, `drafts/bacteria/Chlamydia trachomatis.md:8` |
| `습윤환경` | 2 | `drafts/bacteria/Pseudomonas aeruginosa.md:8`, `drafts/bacteria/Serratia marcescens.md:8` |
| `신경` | 2 | `drafts/bacteria/Borrelia burgdorferi.md:8`, `drafts/bacteria/Treponema pallidum.md:8` |
| `조직` | 2 | `drafts/nematode/Toxocara cati.md:8`, `drafts/trematode/Alaria.md:8` |
| `혈관` | 2 | `drafts/fungus/Aspergillus fumigatus.md:8`, `drafts/trematode/Schistosoma spp.md:8` |
| `혈액` | 2 | `drafts/nematode/Mansonella spp.md:8`, `drafts/virus/LCMV.md:8` |
| `결막낭` | 1 | `drafts/nematode/Thelazia callipaeda.md:8` |
| `관절` | 1 | `drafts/bacteria/Borrelia burgdorferi.md:8` |
| `구강` | 1 | `drafts/bacteria/Viridans streptococci.md:8` |
| `내장` | 1 | `drafts/nematode/Toxocara canis.md:8` |
| `눈물관` | 1 | `drafts/nematode/Thelazia callipaeda.md:8` |
| `림프조직` | 1 | `drafts/virus/Measles.md:8` |
| `망막` | 1 | `drafts/virus/HCMV.md:8` |
| `문맥` | 1 | `drafts/trematode/Schistosoma spp.md:8` |
| `방광정맥` | 1 | `drafts/trematode/Schistosoma spp.md:8` |
| `백혈구` | 1 | `drafts/virus/HCMV.md:8` |
| `비인두` | 1 | `drafts/bacteria/Neisseria meningitidis.md:8` |
| `사지` | 1 | `drafts/nematode/Brugia malayi.md:8` |
| `상기도` | 1 | `drafts/bacteria/Moraxella catarrhalis.md:8` |
| `상처` | 1 | `drafts/bacteria/Pseudomonas aeruginosa.md:8` |
| `상피부착` | 1 | `drafts/bacteria/UPEC.md:8` |
| `소장융모` | 1 | `drafts/virus/Rotavirus.md:8` |
| `소장점막` | 1 | `drafts/nematode/Capillaria philippinensis.md:8` |
| `수계환경` | 1 | `drafts/bacteria/Legionella pneumophila.md:8` |
| `수막` | 1 | `drafts/bacteria/Neisseria meningitidis.md:8` |
| `신경절` | 1 | `drafts/virus/HSV.md:8` |
| `심내막` | 1 | `drafts/bacteria/Viridans streptococci.md:8` |
| `심장` | 1 | `drafts/nematode/Dirofilaria immitis.md:8` |
| `위벽` | 1 | `drafts/nematode/Anisakis simplex.md:8` |
| `위점막` | 1 | `drafts/bacteria/Helicobacter pylori.md:8` |
| `의료기구` | 1 | `drafts/bacteria/Serratia marcescens.md:8` |
| `의료기구표면` | 1 | `drafts/bacteria/Staphylococcus epidermidis.md:8` |
| `인두상피` | 1 | `drafts/virus/EBV.md:8` |
| `장막` | 1 | `drafts/nematode/Mansonella spp.md:8` |
| `장벽` | 1 | `drafts/nematode/Anisakis simplex.md:8` |
| `적혈구` | 1 | `drafts/protozoa/Plasmodium spp.md:8` |
| `전각운동신경` | 1 | `drafts/virus/Poliovirus.md:8` |
| `치면` | 1 | `drafts/bacteria/Viridans streptococci.md:8` |
| `침샘` | 1 | `drafts/virus/HCMV.md:8` |
| `태반` | 1 | `drafts/virus/HCMV.md:8` |
| `폐이행` | 1 | `drafts/nematode/Ascaris lumbricoides.md:8` |
| `폐혈관` | 1 | `drafts/nematode/Dirofilaria immitis.md:8` |
| `포식소체` | 1 | `drafts/bacteria/Mycobacterium tuberculosis.md:8` |
| `피부세포내` | 1 | `drafts/bacteria/Mycobacterium leprae.md:8` |
| `피부연조직` | 1 | `drafts/bacteria/Vibrio vulnificus.md:8` |
| `항문주위` | 1 | `drafts/nematode/Enterobius vermicularis.md:8` |
| `혈관내피` | 1 | `drafts/virus/SARS-CoV-2.md:8` |
| `혈관내피세포` | 1 | `drafts/bacteria/Rickettsia spp.md:8` |
| `혐기조직` | 1 | `drafts/bacteria/Clostridium perfringens.md:8` |
| `호흡기섬모상피` | 1 | `drafts/bacteria/Bordetella pertussis.md:8` |
| `횡문근` | 1 | `drafts/nematode/Trichinella spiralis.md:8` |
| `B세포` | 1 | `drafts/virus/EBV.md:8` |

### 2-3. evasion (VOCAB §2-3)

미등재 값 없음.

### 2-4. pathway (VOCAB §2-4)

| 값 | 사용 | 위치 |
|---|---:|---|
| `점막` | 8 | `drafts/bacteria/Chlamydia spp.md:9`, `drafts/bacteria/Chlamydia trachomatis.md:9`, `drafts/bacteria/Gardnerella vaginalis.md:9` 외 5 |
| `기회감염` | 7 | `drafts/bacteria/Enterococcus faecalis.md:9`, `drafts/bacteria/Enterococcus faecium.md:9`, `drafts/bacteria/Moraxella catarrhalis.md:9` 외 4 |
| `병원내` | 7 | `drafts/bacteria/CRE.md:9`, `drafts/bacteria/Enterococcus faecalis.md:9`, `drafts/bacteria/Enterococcus faecium.md:9` 외 4 |
| `충란섭취` | 7 | `drafts/cestode/Hymenolepis nana.md:9`, `drafts/cestode/Taenia solium.md:9`, `drafts/nematode/Ascaris lumbricoides.md:9` 외 4 |
| `분변-경구` | 6 | `drafts/protozoa/Entamoeba histolytica.md:9`, `drafts/virus/Adenovirus.md:9`, `drafts/virus/Hepatitis viruses.md:9` 외 3 |
| `혈류` | 6 | `drafts/bacteria/Escherichia coli.md:9`, `drafts/bacteria/Hypervirulent Klebsiella pneumoniae.md:9`, `drafts/bacteria/Salmonella Paratyphi.md:9` 외 3 |
| `모기매개` | 5 | `drafts/nematode/Brugia malayi.md:9`, `drafts/nematode/Brugia timori.md:9`, `drafts/nematode/Dirofilaria immitis.md:9` 외 2 |
| `분변구강` | 4 | `drafts/bacteria/Shigella dysenteriae.md:9`, `drafts/bacteria/Shigella flexneri.md:9`, `drafts/bacteria/Shigella sonnei.md:9` 외 1 |
| `자가감염` | 4 | `drafts/cestode/Hymenolepis nana.md:9`, `drafts/nematode/Capillaria philippinensis.md:9`, `drafts/nematode/Enterobius vermicularis.md:9` 외 1 |
| `피부침투` | 4 | `drafts/nematode/Ancylostoma duodenale.md:9`, `drafts/nematode/Necator americanus.md:9`, `drafts/nematode/Strongyloides stercoralis.md:9` 외 1 |
| `비말` | 3 | `drafts/virus/Adenovirus.md:9`, `drafts/virus/Influenza virus.md:9`, `drafts/virus/SARS-CoV-2.md:9` |
| `오염식품` | 3 | `drafts/bacteria/EHEC_STEC E. coli O157_H7.md:9`, `drafts/bacteria/Salmonella Enteritidis.md:9`, `drafts/virus/Norovirus.md:9` |
| `요로` | 3 | `drafts/bacteria/Escherichia coli.md:9`, `drafts/bacteria/Proteus mirabilis.md:9`, `drafts/bacteria/UPEC.md:9` |
| `의료기구` | 3 | `drafts/bacteria/CRE.md:9`, `drafts/bacteria/Serratia marcescens.md:9`, `drafts/bacteria/Staphylococcus epidermidis.md:9` |
| `접촉` | 3 | `drafts/nematode/Enterobius vermicularis.md:9`, `drafts/virus/Adenovirus.md:9`, `drafts/virus/HSV.md:9` |
| `태반` | 3 | `drafts/bacteria/Listeria monocytogenes.md:9`, `drafts/protozoa/Toxoplasma gondii.md:9`, `drafts/virus/HCMV.md:9` |
| `피부` | 3 | `drafts/bacteria/Mycobacterium vaccae.md:9`, `drafts/bacteria/Staphylococcus aureus.md:9`, `drafts/bacteria/Streptococcus pyogenes.md:9` |
| `호흡기비말` | 3 | `drafts/bacteria/Bordetella pertussis.md:9`, `drafts/bacteria/Haemophilus influenzae.md:9`, `drafts/bacteria/Neisseria meningitidis.md:9` |
| `개구리` | 2 | `drafts/nematode/Gnathostoma spp.md:9`, `drafts/trematode/Alaria.md:9` |
| `눈` | 2 | `drafts/bacteria/Chlamydia trachomatis.md:9`, `drafts/bacteria/Hypervirulent Klebsiella pneumoniae.md:9` |
| `덜익힘` | 2 | `drafts/nematode/Gnathostoma spp.md:9`, `drafts/trematode/Alaria.md:9` |
| `동물성식품` | 2 | `drafts/bacteria/Mycobacterium bovis.md:9`, `drafts/bacteria/Salmonella Typhimurium.md:9` |
| `돼지고기` | 2 | `drafts/bacteria/Yersinia enterocolitica.md:9`, `drafts/cestode/Taenia solium.md:9` |
| `민물고기` | 2 | `drafts/nematode/Gnathostoma spp.md:9`, `drafts/trematode/Heterophyes.md:9` |
| `민물고기섭취` | 2 | `drafts/trematode/Metagonimus.md:9`, `drafts/trematode/Opisthorchis spp.md:9` |
| `뱀` | 2 | `drafts/nematode/Gnathostoma spp.md:9`, `drafts/trematode/Alaria.md:9` |
| `수생식물섭취` | 2 | `drafts/trematode/Fasciola gigantica.md:9`, `drafts/trematode/Fasciola hepatica.md:9` |
| `타액` | 2 | `drafts/virus/EBV.md:9`, `drafts/virus/Rabies.md:9` |
| `해산물` | 2 | `drafts/bacteria/Vibrio parahaemolyticus.md:9`, `drafts/bacteria/Vibrio vulnificus.md:9` |
| `가금류` | 1 | `drafts/bacteria/Campylobacter jejuni.md:9` |
| `가재섭취` | 1 | `drafts/trematode/Paragonimus westermani.md:9` |
| `간` | 1 | `drafts/bacteria/Hypervirulent Klebsiella pneumoniae.md:9` |
| `고양이` | 1 | `drafts/nematode/Toxocara cati.md:9` |
| `고양이오오시스트` | 1 | `drafts/protozoa/Toxoplasma gondii.md:9` |
| `공기매개` | 1 | `drafts/virus/Measles.md:9` |
| `구강-구강` | 1 | `drafts/bacteria/Helicobacter pylori.md:9` |
| `구강상재` | 1 | `drafts/bacteria/Viridans streptococci.md:9` |
| `낭미충섭취` | 1 | `drafts/cestode/Taenia saginata.md:9` |
| `내인성` | 1 | `drafts/fungus/Candida albicans.md:9` |
| `달팽이` | 1 | `drafts/nematode/Angiostrongylus cantonensis.md:9` |
| `담수` | 1 | `drafts/trematode/Schistosoma spp.md:9` |
| `덜익힌돼지고기` | 1 | `drafts/nematode/Trichinella spiralis.md:9` |
| `동물교상` | 1 | `drafts/virus/Rabies.md:9` |
| `동물원성` | 1 | `drafts/nematode/Dirofilaria immitis.md:9` |
| `동물접촉` | 1 | `drafts/bacteria/Mycobacterium bovis.md:9` |
| `등에매개` | 1 | `drafts/nematode/Loa loa.md:9` |
| `먹파리매개` | 1 | `drafts/nematode/Onchocerca volvulus.md:9` |
| `모래파리매개` | 1 | `drafts/protozoa/Leishmania spp.md:9` |
| `물벼룩섭취` | 1 | `drafts/nematode/Dracunculus medinensis.md:9` |
| `물접촉` | 1 | `drafts/nematode/Dracunculus medinensis.md:9` |
| `민간요법` | 1 | `drafts/cestode/Sparganum Spirometra spp.md:9` |
| `민달팽이` | 1 | `drafts/nematode/Angiostrongylus cantonensis.md:9` |
| `뱀개구리생식` | 1 | `drafts/cestode/Sparganum Spirometra spp.md:9` |
| `벼룩` | 1 | `drafts/bacteria/Yersinia pestis.md:9` |
| `보유숙주` | 1 | `drafts/nematode/Capillaria hepatica.md:9` |
| `분변-구강` | 1 | `drafts/bacteria/Helicobacter pylori.md:9` |
| `상처해수` | 1 | `drafts/bacteria/Vibrio vulnificus.md:9` |
| `설치류분비물` | 1 | `drafts/virus/LCMV.md:9` |
| `소고기` | 1 | `drafts/cestode/Taenia saginata.md:9` |
| `소아장염` | 1 | `drafts/virus/Rotavirus.md:9` |
| `양서류섭취` | 1 | `drafts/trematode/Echinostoma.md:9` |
| `어류` | 1 | `drafts/trematode/Echinostoma.md:9` |
| `어류섭취` | 1 | `drafts/nematode/Capillaria philippinensis.md:9` |
| `에어로졸` | 1 | `drafts/virus/SARS-CoV-2.md:9` |
| `에어로졸흡입` | 1 | `drafts/bacteria/Legionella pneumophila.md:9` |
| `영아장관` | 1 | `drafts/bacteria/Clostridium botulinum.md:9` |
| `은어` | 1 | `drafts/trematode/Metagonimus.md:9` |
| `음식` | 1 | `drafts/bacteria/Clostridium botulinum.md:9` |
| `이식` | 1 | `drafts/virus/HCMV.md:9` |
| `장관` | 1 | `drafts/bacteria/CRE.md:9` |
| `장기접촉` | 1 | `drafts/bacteria/Mycobacterium leprae.md:9` |
| `절지동물매개` | 1 | `drafts/bacteria/Rickettsia spp.md:9` |
| `조직낭종섭취` | 1 | `drafts/protozoa/Toxoplasma gondii.md:9` |
| `중간숙주섭취` | 1 | `drafts/nematode/Angiostrongylus cantonensis.md:9` |
| `진드기매개` | 1 | `drafts/bacteria/Borrelia burgdorferi.md:9` |
| `집단발생` | 1 | `drafts/virus/Norovirus.md:9` |
| `참게` | 1 | `drafts/trematode/Paragonimus westermani.md:9` |
| `체액` | 1 | `drafts/virus/HCMV.md:9` |
| `초파리매개` | 1 | `drafts/nematode/Thelazia callipaeda.md:9` |
| `치과시술` | 1 | `drafts/bacteria/Viridans streptococci.md:9` |
| `침` | 1 | `drafts/virus/EBV.md:9` |
| `카테터` | 1 | `drafts/bacteria/Proteus mirabilis.md:9` |
| `패류` | 1 | `drafts/trematode/Echinostoma.md:9` |
| `포낭섭취` | 1 | `drafts/protozoa/Entamoeba histolytica.md:9` |
| `포자흡입` | 1 | `drafts/fungus/Aspergillus fumigatus.md:9` |
| `항생제압박` | 1 | `drafts/bacteria/VRE.md:9` |
| `항생제후` | 1 | `drafts/bacteria/Clostridioides difficile.md:9` |
| `해산어섭취` | 1 | `drafts/trematode/Heterophyes.md:9` |
| `흡입` | 1 | `drafts/virus/LCMV.md:9` |
| `흡혈곤충매개` | 1 | `drafts/nematode/Mansonella spp.md:9` |

### 2-5. 상태이상 (VOCAB §3)

미등재 값 없음.

### 2-6. 기술 타입 (VOCAB §5)

| 값 | 사용 | 위치 |
|---|---:|---|
| `기생` | 27 | `drafts/cestode/Hymenolepis nana.md:43`, `drafts/cestode/Hymenolepis nana.md:62`, `drafts/cestode/Taenia saginata.md:43` 외 24 |
| `특수` | 26 | `drafts/bacteria/Brucella spp.md:60`, `drafts/bacteria/Brucella spp.md:78`, `drafts/bacteria/Enterobacter aerogenes.md:60` 외 23 |
| `소화기` | 16 | `drafts/bacteria/Campylobacter jejuni.md:43`, `drafts/bacteria/Clostridioides difficile.md:89`, `drafts/bacteria/EAEC.md:70` 외 13 |
| `호흡기` | 16 | `drafts/bacteria/Bordetella pertussis.md:81`, `drafts/bacteria/Corynebacterium diphtheriae.md:70`, `drafts/bacteria/Haemophilus influenzae.md:62` 외 13 |
| `조직융해` | 15 | `drafts/bacteria/Bacteroides spp.md:42`, `drafts/bacteria/Bacteroides spp.md:78`, `drafts/bacteria/Clostridium perfringens.md:81` 외 12 |
| `세포내` | 9 | `drafts/bacteria/Chlamydia spp.md:43`, `drafts/bacteria/Chlamydia spp.md:81`, `drafts/bacteria/Chlamydia trachomatis.md:81` 외 6 |
| `이동` | 8 | `drafts/cestode/Sparganum Spirometra spp.md:51`, `drafts/cestode/Sparganum Spirometra spp.md:70`, `drafts/nematode/Ascaris lumbricoides.md:51` 외 5 |
| `내성` | 7 | `drafts/bacteria/CRE.md:51`, `drafts/bacteria/CRE.md:89`, `drafts/bacteria/Enterococcus faecium.md:43` 외 4 |
| `장관` | 6 | `drafts/virus/Adenovirus.md:62`, `drafts/virus/Norovirus.md:43`, `drafts/virus/Norovirus.md:62` 외 3 |
| `바이러스` | 5 | `drafts/virus/Adenovirus.md:81`, `drafts/virus/Hepatitis viruses.md:81`, `drafts/virus/Influenza virus.md:62` 외 2 |
| `전파` | 5 | `drafts/bacteria/Shigella sonnei.md:70`, `drafts/bacteria/Shigella sonnei.md:89`, `drafts/nematode/Dracunculus medinensis.md:70` 외 2 |
| `눈` | 4 | `drafts/nematode/Loa loa.md:70`, `drafts/nematode/Onchocerca volvulus.md:70`, `drafts/nematode/Thelazia callipaeda.md:51` 외 1 |
| `진균` | 4 | `drafts/fungus/Aspergillus fumigatus.md:81`, `drafts/fungus/Candida albicans.md:43`, `drafts/fungus/Candida albicans.md:62` 외 1 |
| `혈류` | 4 | `drafts/bacteria/Enterococcus faecalis.md:62`, `drafts/bacteria/Treponema pallidum.md:43`, `drafts/bacteria/Vibrio vulnificus.md:62` 외 1 |
| `요로` | 3 | `drafts/bacteria/Proteus mirabilis.md:62`, `drafts/bacteria/UPEC.md:70`, `drafts/bacteria/UPEC.md:89` |
| `증식` | 3 | `drafts/bacteria/Listeria monocytogenes.md:89`, `drafts/nematode/Capillaria philippinensis.md:70`, `drafts/nematode/Strongyloides stercoralis.md:70` |
| `흡혈` | 3 | `drafts/nematode/Ancylostoma duodenale.md:51`, `drafts/nematode/Necator americanus.md:51`, `drafts/nematode/Necator americanus.md:70` |
| `기회감염` | 2 | `drafts/bacteria/Enterococcus faecalis.md:43`, `drafts/bacteria/Serratia marcescens.md:62` |
| `대형기생` | 2 | `drafts/nematode/Ascaris lumbricoides.md:70`, `drafts/nematode/Trichuris trichiura.md:70` |
| `세포변성` | 2 | `drafts/virus/HCMV.md:43`, `drafts/virus/HSV.md:43` |
| `혈액` | 2 | `drafts/protozoa/Plasmodium spp.md:43`, `drafts/protozoa/Plasmodium spp.md:62` |
| `피부` | 1 | `drafts/bacteria/Borrelia burgdorferi.md:43` |
| `혈관` | 1 | `drafts/trematode/Schistosoma spp.md:70` |
| `회피` | 1 | `drafts/bacteria/Neisseria gonorrhoeae.md:62` |

### 2-7. 효과 (VOCAB §4)

| 값 | 사용 | 위치 |
|---|---:|---|
| `공격력 +1랭크` | 136 | `drafts/bacteria/Bacteroides spp.md:34`, `drafts/bacteria/Bordetella pertussis.md:34`, `drafts/bacteria/Borrelia burgdorferi.md:34` 외 133 |
| `공격력 +2랭크` | 9 | `drafts/bacteria/Clostridium tetani.md:97`, `drafts/bacteria/Corynebacterium diphtheriae.md:97`, `drafts/bacteria/Escherichia coli.md:97` 외 6 |
| `2턴 무적` | 8 | `drafts/bacteria/Chlamydia spp.md:89`, `drafts/bacteria/Chlamydia trachomatis.md:89`, `drafts/cestode/Hymenolepis nana.md:70` 외 5 |
| `공격력 +4랭크` | 1 | `Bacillus anthracis.md:56` |
| `체력 20% 이하일 때 체력 전체 회복(3)` | 1 | `drafts/bacteria/Listeria monocytogenes.md:97` |

## 3. 빈 필드 (TEMPLATE-v2: 해당 없으면 `—`)

**131개 전부 위반.** 공란 필드 총 1047개. v1 템플릿이 `효과/상태이상/증상` 을 빈 줄로 두는 구조라 전수 적중이며, 개별 노트 결함이라기보다 **템플릿 자체를 v2로 갈아야 해소된다.**

공란 필드 종류별 빈도:

| 필드 | 공란 수 | 성격 |
|---|---:|---|
| `effect` | 461 | v1 템플릿 기본 공란 — v2에서 `—` 필수 |
| `결과.효과` | 266 | v1 템플릿 기본 공란 — v2에서 `—` 필수 |
| `결과.상태이상` | 160 | v1 템플릿 기본 공란 — v2에서 `—` 필수 |
| `결과.증상` | 129 | v1 템플릿 기본 공란 — v2에서 `—` 필수 |
| `공격` | 10 | **실제 누락** (값이 있어야 하는 자리) |
| `방어` | 10 | **실제 누락** (값이 있어야 하는 자리) |
| `HP` | 10 | **실제 누락** (값이 있어야 하는 자리) |
| `위력` | 1 | **실제 누락** (값이 있어야 하는 자리) |

능력치 3축이 통째로 빈 노트 10개 — 이쪽은 템플릿 문제가 아니라 미작성이다.

| 노트 | 선정# | 공란 수 | 예시 |
|---|---|---:|---|
| `drafts/bacteria/Enterobacter aerogenes.md` | — | 12 | 능력치.HP, 능력치.공격, 능력치.방어 |
| `drafts/bacteria/Enterobacter cloacae.md` | — | 12 | 능력치.HP, 능력치.공격, 능력치.방어 |
| `Bacillus anthracis.md` | **1** | 12 | 아포 발아.effect, 아포 발아.결과.상태이상, 아포 발아.결과.상태이상 |
| `drafts/bacteria/Bacteroides spp.md` | — | 11 | 능력치.HP, 능력치.공격, 능력치.방어 |
| `drafts/bacteria/Brucella spp.md` | — | 11 | 능력치.HP, 능력치.공격, 능력치.방어 |
| `drafts/bacteria/Lactobacillus spp.md` | — | 11 | 능력치.HP, 능력치.공격, 능력치.방어 |
| `drafts/bacteria/Mycobacterium vaccae.md` | — | 11 | 능력치.HP, 능력치.공격, 능력치.방어 |
| `drafts/bacteria/Prevotella spp.md` | — | 11 | 능력치.HP, 능력치.공격, 능력치.방어 |
| `drafts/bacteria/Salmonella bongori.md` | — | 11 | 능력치.HP, 능력치.공격, 능력치.방어 |
| `drafts/bacteria/Salmonella enterica.md` | — | 11 | 능력치.HP, 능력치.공격, 능력치.방어 |
| `drafts/bacteria/Yersinia pseudotuberculosis.md` | — | 11 | 능력치.HP, 능력치.공격, 능력치.방어 |
| `drafts/bacteria/Chlamydia spp.md` | — | 10 | 감염소체 흡착.effect, 감염소체 흡착.결과.상태이상, 감염소체 흡착.결과.증상 |
| `drafts/bacteria/Chlamydia trachomatis.md` | — | 10 | 점막 부착.effect, 점막 부착.결과.상태이상, 점막 부착.결과.증상 |
| `drafts/bacteria/Escherichia coli.md` | **11** | 10 | 장관 정착.effect, 장관 정착.결과.상태이상, 장관 정착.결과.증상 |
| `drafts/bacteria/Listeria monocytogenes.md` | **3** | 10 | 장상피 잠입.effect, 장상피 잠입.결과.상태이상, 장상피 잠입.결과.증상 |
| `drafts/bacteria/Streptococcus pneumoniae.md` | **10** | 10 | 비인두 정착.effect, 비인두 정착.결과.상태이상, 비인두 정착.결과.증상 |
| `drafts/fungus/Candida albicans.md` | — | 10 | 점막 정착.effect, 점막 정착.결과.상태이상, 점막 정착.결과.증상 |
| `drafts/nematode/Mansonella spp.md` | — | 10 | 흡혈곤충 매개.effect, 흡혈곤충 매개.결과.상태이상, 흡혈곤충 매개.결과.증상 |
| `drafts/virus/Adenovirus.md` | — | 10 | 비외피 버티기.effect, 비외피 버티기.결과.상태이상, 비외피 버티기.결과.증상 |
| `drafts/virus/Hepatitis viruses.md` | — | 10 | 전파형 선택.effect, 전파형 선택.결과.상태이상, 전파형 선택.결과.증상 |
| `drafts/virus/HSV.md` | — | 10 | 점막 접촉.effect, 점막 접촉.결과.상태이상, 점막 접촉.결과.증상 |
| `drafts/bacteria/Bordetella pertussis.md` | — | 9 | 섬모상피 부착.effect, 섬모상피 부착.결과.상태이상, 섬모상피 부착.결과.증상 |
| `drafts/bacteria/Clostridioides difficile.md` | **5** | 9 | 균총 공백 점령.effect, 균총 공백 점령.결과.상태이상, 균총 공백 점령.결과.증상 |
| `drafts/bacteria/Clostridium botulinum.md` | **7** | 9 | 혐기 식품 잠복.effect, 혐기 식품 잠복.결과.상태이상, 혐기 식품 잠복.결과.증상 |
| `drafts/bacteria/Clostridium perfringens.md` | — | 9 | 혐기 상처 발아.effect, 혐기 상처 발아.결과.상태이상, 혐기 상처 발아.결과.증상 |
| `drafts/bacteria/CRE.md` | **29** | 9 | 병원내 정착.effect, 병원내 정착.결과.상태이상, 병원내 정착.결과.증상 |
| `drafts/bacteria/EHEC_STEC E. coli O157_H7.md` | **15** | 9 | 산성 장벽 통과.effect, 산성 장벽 통과.결과.상태이상, 산성 장벽 통과.결과.증상 |
| `drafts/bacteria/EIEC.md` | **16** | 9 | 대장상피 침입.effect, 대장상피 침입.결과.상태이상, 대장상피 침입.결과.증상 |
| `drafts/bacteria/ETEC.md` | **12** | 9 | 오염수 정착.effect, 오염수 정착.결과.상태이상, 오염수 정착.결과.증상 |
| `drafts/bacteria/Legionella pneumophila.md` | — | 9 | 에어로졸 흡입.effect, 에어로졸 흡입.결과.상태이상, 에어로졸 흡입.결과.증상 |
| `drafts/bacteria/Moraxella catarrhalis.md` | — | 9 | 상기도 정착.effect, 상기도 정착.결과.상태이상, 상기도 정착.결과.증상 |
| `drafts/bacteria/Mycoplasma spp.md` | **56** | 9 | 말랑막 부착.effect, 말랑막 부착.결과.상태이상, 비정형 기침.effect |
| `drafts/bacteria/Nocardia spp.md` | **59** | 9 | 분지성 가지치기.effect, 분지성 가지치기.결과.상태이상, 폐 결절 침투.effect |
| `drafts/bacteria/Rickettsia spp.md` | — | 9 | 절지동물 물림.effect, 절지동물 물림.결과.상태이상, 절지동물 물림.결과.증상 |
| `drafts/bacteria/Salmonella Enteritidis.md` | **20** | 9 | 오염 식품 진입.effect, 오염 식품 진입.결과.상태이상, 오염 식품 진입.결과.증상 |
| `drafts/bacteria/Shigella dysenteriae.md` | **25** | 9 | 대장 침입.effect, 대장 침입.결과.상태이상, 대장 침입.결과.증상 |
| `drafts/bacteria/Shigella flexneri.md` | **23** | 9 | 대장 점막 침입.effect, 대장 점막 침입.결과.상태이상, 대장 점막 침입.결과.증상 |
| `drafts/bacteria/Shigella spp.md` | **22** | 9 | 낮은 감염량 돌파.effect, 낮은 감염량 돌파.결과.상태이상, 낮은 감염량 돌파.결과.증상 |
| `drafts/bacteria/UPEC.md` | **17** | 9 | 요로 상행.effect, 요로 상행.결과.상태이상, 요로 상행.결과.증상 |
| `drafts/bacteria/Yersinia pestis.md` | **26** | 9 | 벼룩 주입.effect, 벼룩 주입.결과.상태이상, 벼룩 주입.결과.증상 |
| `drafts/fungus/Aspergillus fumigatus.md` | — | 9 | 포자 흡입.effect, 포자 흡입.결과.상태이상, 포자 흡입.결과.증상 |
| `drafts/nematode/Gnathostoma spp.md` | — | 9 | 덜익힌 유충 섭취.effect, 덜익힌 유충 섭취.결과.상태이상, 덜익힌 유충 섭취.결과.증상 |
| `drafts/protozoa/Entamoeba histolytica.md` | — | 9 | 포낭 섭취.effect, 포낭 섭취.결과.상태이상, 포낭 섭취.결과.증상 |
| `drafts/protozoa/Leishmania spp.md` | — | 9 | 모래파리 흡혈.effect, 모래파리 흡혈.결과.상태이상, 모래파리 흡혈.결과.증상 |
| `drafts/protozoa/Toxoplasma gondii.md` | — | 9 | 오오시스트 섭취.effect, 오오시스트 섭취.결과.상태이상, 오오시스트 섭취.결과.증상 |
| `drafts/virus/EBV.md` | — | 9 | 타액 전파.effect, 타액 전파.결과.상태이상, 타액 전파.결과.증상 |
| `drafts/virus/HCMV.md` | — | 9 | 체액 잠입.effect, 체액 잠입.결과.상태이상, 체액 잠입.결과.증상 |
| `drafts/virus/Influenza virus.md` | — | 9 | 비말 흡입.effect, 비말 흡입.결과.상태이상, 비말 흡입.결과.증상 |
| `drafts/virus/Norovirus.md` | — | 9 | 오염식품 섭취.effect, 오염식품 섭취.결과.상태이상, 오염식품 섭취.결과.증상 |
| `drafts/virus/SARS-CoV-2.md` | — | 9 | 스파이크 결합.effect, 스파이크 결합.결과.상태이상, 스파이크 결합.결과.증상 |
| `Bacillus cereus.md` | **2** | 9 | 장 감염.effect, 장 감염.결과.상태이상, 장 독소 Emetic form.effect |
| `drafts/bacteria/Clostridium tetani.md` | **6** | 8 | 오염 상처 발아.effect, 오염 상처 발아.결과.상태이상, 오염 상처 발아.결과.증상 |
| `drafts/bacteria/Corynebacterium diphtheriae.md` | **4** | 8 | 인두 정착.effect, 인두 정착.결과.상태이상, 인두 정착.결과.증상 |
| `drafts/bacteria/EAEC.md` | **14** | 8 | 집합 부착.effect, 집합 부착.결과.상태이상, 집합 부착.결과.증상 |
| `drafts/bacteria/EPEC.md` | **13** | 8 | 장상피 부착.effect, 장상피 부착.결과.상태이상, 장상피 부착.결과.증상 |
| `drafts/bacteria/Gardnerella vaginalis.md` | **58** | 8 | 균총 균형 흔들기.effect, 균총 균형 흔들기.결과.상태이상, Clue cell 덮개.effect |
| `drafts/bacteria/Helicobacter pylori.md` | — | 8 | 위점막 잠입.effect, 위점막 잠입.결과.상태이상, 위점막 잠입.결과.증상 |
| `drafts/bacteria/Hypervirulent Klebsiella pneumoniae.md` | **28** | 8 | 과점액 협막 팽창.effect, 과점액 협막 팽창.결과.상태이상, 과점액 협막 팽창.결과.증상 |
| `drafts/bacteria/Klebsiella pneumoniae.md` | **27** | 8 | 점액 협막 팽창.effect, 점액 협막 팽창.결과.상태이상, 점액 협막 팽창.결과.증상 |
| `drafts/bacteria/Mycoplasma hominis.md` | **55** | 8 | 무세포벽 변형.effect, 무세포벽 변형.결과.상태이상, 점막 부착.effect |
| `drafts/bacteria/Pseudomonas aeruginosa.md` | — | 8 | 습윤환경 정착.effect, 습윤환경 정착.결과.상태이상, 습윤환경 정착.결과.증상 |
| `drafts/bacteria/Salmonella Paratyphi.md` | **19** | 8 | 장관 통과.effect, 장관 통과.결과.상태이상, 장관 통과.결과.증상 |
| `drafts/bacteria/Salmonella Typhimurium.md` | **21** | 8 | M세포 침입.effect, M세포 침입.결과.상태이상, M세포 침입.결과.증상 |
| `drafts/bacteria/Shigella sonnei.md` | **24** | 8 | 접촉 전파.effect, 접촉 전파.결과.상태이상, 접촉 전파.결과.증상 |
| `drafts/bacteria/Staphylococcus aureus.md` | **8** | 8 | 피부 정착.effect, 피부 정착.결과.상태이상, 피부 정착.결과.증상 |
| `drafts/bacteria/Streptococcus agalactiae.md` | — | 8 | 산도 정착.effect, 산도 정착.결과.상태이상, 산도 정착.결과.증상 |
| `drafts/bacteria/Streptococcus pyogenes.md` | **9** | 8 | 인두 피부 부착.effect, 인두 피부 부착.결과.상태이상, 인두 피부 부착.결과.증상 |
| `drafts/bacteria/Ureaplasma urealyticum.md` | **57** | 8 | 요소 감지.effect, 요소 감지.결과.상태이상, 유레아제 자극.effect |
| `drafts/virus/HIV.md` | **31** | 8 | gp120 결합.effect, gp120 결합.결과.상태이상, gp120 결합.결과.증상 |
| `drafts/bacteria/Borrelia burgdorferi.md` | — | 7 | 진드기 흡혈전파.effect, 진드기 흡혈전파.결과.상태이상, 진드기 흡혈전파.결과.증상 |
| `drafts/bacteria/Campylobacter jejuni.md` | — | 7 | 가금류 섭취감염.effect, 가금류 섭취감염.결과.상태이상, 가금류 섭취감염.결과.증상 |
| `drafts/bacteria/Haemophilus influenzae.md` | — | 7 | 비인두 정착.effect, 비인두 정착.결과.상태이상, 비인두 정착.결과.증상 |
| `drafts/bacteria/Mycobacterium bovis.md` | — | 7 | 동물성 경로.effect, 동물성 경로.결과.상태이상, 동물성 경로.결과.증상 |
| `drafts/bacteria/Mycobacterium leprae.md` | — | 7 | 장기접촉 잠입.effect, 장기접촉 잠입.결과.상태이상, 장기접촉 잠입.결과.증상 |
| `drafts/bacteria/Mycobacterium tuberculosis.md` | **30** | 7 | 폐포 대식세포 진입.effect, 폐포 대식세포 진입.결과.상태이상, 폐포 대식세포 진입.결과.증상 |
| `drafts/bacteria/Proteus mirabilis.md` | — | 7 | 요로 상승운동.effect, 요로 상승운동.결과.상태이상, 요로 상승운동.결과.증상 |
| `drafts/bacteria/Salmonella Typhi.md` | **18** | 7 | 장관 침투.effect, 장관 침투.결과.상태이상, 장관 침투.결과.증상 |
| `drafts/bacteria/Vibrio cholerae.md` | — | 7 | 오염수 유입.effect, 오염수 유입.결과.상태이상, 오염수 유입.결과.증상 |
| `drafts/bacteria/Vibrio parahaemolyticus.md` | — | 7 | 해산물 장착.effect, 해산물 장착.결과.상태이상, 해산물 장착.결과.증상 |
| `drafts/bacteria/Vibrio vulnificus.md` | — | 7 | 해산물 상처진입.effect, 해산물 상처진입.결과.상태이상, 해산물 상처진입.결과.증상 |
| `drafts/bacteria/Yersinia enterocolitica.md` | — | 7 | 냉장 식품 잠입.effect, 냉장 식품 잠입.결과.상태이상, 냉장 식품 잠입.결과.증상 |
| `drafts/cestode/Sparganum Spirometra spp.md` | **53** | 7 | 오염수 원미충.effect, 오염수 원미충.결과.상태이상, 오염수 원미충.결과.증상 |
| `drafts/cestode/Taenia saginata.md` | — | 7 | 소고기 낭미충.effect, 소고기 낭미충.결과.상태이상, 소고기 낭미충.결과.증상 |
| `drafts/cestode/Taenia solium.md` | **54** | 7 | 돼지고기 낭미충.effect, 돼지고기 낭미충.결과.상태이상, 돼지고기 낭미충.결과.증상 |
| `drafts/nematode/Angiostrongylus cantonensis.md` | — | 7 | 달팽이 유충 섭취.effect, 달팽이 유충 섭취.결과.상태이상, 달팽이 유충 섭취.결과.증상 |
| `drafts/nematode/Anisakis simplex.md` | **33** | 7 | 생선회 잠입.effect, 생선회 잠입.결과.상태이상, 생선회 잠입.결과.증상 |
| `drafts/nematode/Ascaris lumbricoides.md` | **32** | 7 | 충란 섭취.effect, 충란 섭취.결과.상태이상, 충란 섭취.결과.증상 |
| `drafts/nematode/Brugia timori.md` | — | 7 | 모기 매개 유충.effect, 모기 매개 유충.결과.상태이상, 모기 매개 유충.결과.증상 |
| `drafts/nematode/Capillaria hepatica.md` | **36** | 7 | 간실질 잠입.effect, 간실질 잠입.결과.상태이상, 간실질 잠입.결과.증상 |
| `drafts/nematode/Dirofilaria immitis.md` | — | 7 | 모기 유충 주입.effect, 모기 유충 주입.결과.상태이상, 모기 유충 주입.결과.증상 |
| `drafts/nematode/Loa loa.md` | **46** | 7 | 등에 매개 침입.effect, 등에 매개 침입.결과.상태이상, 등에 매개 침입.결과.증상 |
| `drafts/nematode/Necator americanus.md` | **41** | 7 | 맨발 감염.effect, 맨발 감염.결과.상태이상, 맨발 감염.결과.증상 |
| `drafts/nematode/Onchocerca volvulus.md` | **45** | 7 | 먹파리 주입.effect, 먹파리 주입.결과.상태이상, 먹파리 주입.결과.증상 |
| `drafts/nematode/Toxocara canis.md` | **34** | 7 | 오염토양 충란.effect, 오염토양 충란.결과.상태이상, 오염토양 충란.결과.증상 |
| `drafts/nematode/Toxocara cati.md` | — | 7 | 충란 섭취.effect, 충란 섭취.결과.상태이상, 충란 섭취.결과.증상 |
| `drafts/nematode/Trichuris trichiura.md` | **35** | 7 | 충란 섭취.effect, 충란 섭취.결과.상태이상, 충란 섭취.결과.증상 |
| `drafts/protozoa/Plasmodium spp.md` | — | 7 | 모기 흡혈 주입.effect, 모기 흡혈 주입.결과.상태이상, 모기 흡혈 주입.결과.증상 |
| `drafts/trematode/Alaria.md` | — | 7 | 중간숙주 덜익힘.effect, 중간숙주 덜익힘.결과.상태이상, 중간숙주 덜익힘.결과.증상 |
| `drafts/trematode/Clonorchis sinensis.md` | **49** | 7 | 민물고기 피낭유충.effect, 민물고기 피낭유충.결과.상태이상, 민물고기 피낭유충.결과.증상 |
| `drafts/trematode/Echinostoma.md` | — | 7 | 중간숙주 섭취.effect, 중간숙주 섭취.결과.상태이상, 중간숙주 섭취.결과.증상 |
| `drafts/trematode/Fasciola gigantica.md` | — | 7 | 수생식물 피낭유충.effect, 수생식물 피낭유충.결과.상태이상, 수생식물 피낭유충.결과.증상 |
| `drafts/trematode/Heterophyes.md` | — | 7 | 생선 피낭유충.effect, 생선 피낭유충.결과.상태이상, 생선 피낭유충.결과.증상 |
| `drafts/trematode/Metagonimus.md` | — | 7 | 은어 피낭유충.effect, 은어 피낭유충.결과.상태이상, 은어 피낭유충.결과.증상 |
| `drafts/trematode/Opisthorchis spp.md` | — | 7 | 민물고기 피낭유충.effect, 민물고기 피낭유충.결과.상태이상, 민물고기 피낭유충.결과.증상 |
| `drafts/trematode/Paragonimus westermani.md` | **51** | 7 | 참게 피낭유충.effect, 참게 피낭유충.결과.상태이상, 참게 피낭유충.결과.증상 |
| `drafts/virus/LCMV.md` | — | 7 | 설치류 분비물 흡입.effect, 설치류 분비물 흡입.결과.상태이상, 설치류 분비물 흡입.결과.증상 |
| `drafts/virus/Measles.md` | — | 7 | 공기매개 흡입.effect, 공기매개 흡입.결과.상태이상, 공기매개 흡입.결과.증상 |
| `drafts/virus/Poliovirus.md` | — | 7 | 장관 증식.effect, 장관 증식.결과.상태이상, 장관 증식.결과.증상 |
| `drafts/virus/Rabies.md` | — | 7 | 동물교상 진입.effect, 동물교상 진입.결과.상태이상, 동물교상 진입.결과.증상 |
| `drafts/virus/Rotavirus.md` | — | 7 | 소아 장관 진입.effect, 소아 장관 진입.결과.상태이상, 소아 장관 진입.결과.증상 |
| `drafts/bacteria/Enterococcus faecalis.md` | — | 6 | 장관 상재 대기.effect, 장관 상재 대기.결과.상태이상, 장관 상재 대기.결과.증상 |
| `drafts/bacteria/Neisseria gonorrhoeae.md` | — | 6 | 점막 Pili 부착.effect, 점막 Pili 부착.결과.상태이상, 점막 Pili 부착.결과.증상 |
| `drafts/bacteria/Neisseria meningitidis.md` | — | 6 | 비인두 보균.effect, 비인두 보균.결과.상태이상, 비인두 보균.결과.증상 |
| `drafts/bacteria/Serratia marcescens.md` | — | 6 | 습윤기구 정착.effect, 습윤기구 정착.결과.상태이상, 습윤기구 정착.결과.증상 |
| `drafts/bacteria/Staphylococcus epidermidis.md` | — | 6 | 피부상재 대기.effect, 피부상재 대기.결과.상태이상, 피부상재 대기.결과.증상 |
| `drafts/bacteria/Treponema pallidum.md` | — | 6 | 점막 나선침투.effect, 점막 나선침투.결과.상태이상, 점막 나선침투.결과.증상 |
| `drafts/bacteria/Viridans streptococci.md` | — | 6 | 치면 정착.effect, 치면 정착.결과.상태이상, 치면 정착.결과.증상 |
| `drafts/cestode/Hymenolepis nana.md` | — | 6 | 충란 직접섭취.effect, 충란 직접섭취.결과.상태이상, 충란 직접섭취.결과.증상 |
| `drafts/nematode/Ancylostoma duodenale.md` | **40** | 6 | 피부 관통.effect, 피부 관통.결과.상태이상, 피부 관통.결과.증상 |
| `drafts/nematode/Brugia malayi.md` | **44** | 6 | 모기 흡혈 진입.effect, 모기 흡혈 진입.결과.상태이상, 모기 흡혈 진입.결과.증상 |
| `drafts/nematode/Capillaria philippinensis.md` | **37** | 6 | 어류 매개 감염.effect, 어류 매개 감염.결과.상태이상, 어류 매개 감염.결과.증상 |
| `drafts/nematode/Dracunculus medinensis.md` | **48** | 6 | 물벼룩 섭취.effect, 물벼룩 섭취.결과.상태이상, 물벼룩 섭취.결과.증상 |
| `drafts/nematode/Enterobius vermicularis.md` | **42** | 6 | 접촉 충란 전파.effect, 접촉 충란 전파.결과.상태이상, 접촉 충란 전파.결과.증상 |
| `drafts/nematode/Strongyloides stercoralis.md` | **39** | 6 | 피부 침투.effect, 피부 침투.결과.상태이상, 피부 침투.결과.증상 |
| `drafts/nematode/Thelazia callipaeda.md` | **47** | 6 | 초파리 매개.effect, 초파리 매개.결과.상태이상, 초파리 매개.결과.증상 |
| `drafts/nematode/Trichinella spiralis.md` | **38** | 6 | 덜익힌 고기 섭취.effect, 덜익힌 고기 섭취.결과.상태이상, 덜익힌 고기 섭취.결과.증상 |
| `drafts/nematode/Wuchereria bancrofti.md` | **43** | 6 | 모기 매개 침입.effect, 모기 매개 침입.결과.상태이상, 모기 매개 침입.결과.증상 |
| `drafts/trematode/Fasciola hepatica.md` | **50** | 6 | 수생식물 피낭유충.effect, 수생식물 피낭유충.결과.상태이상, 수생식물 피낭유충.결과.증상 |
| `drafts/bacteria/Enterococcus faecium.md` | — | 5 | 병원내 장관정착.effect, 병원내 장관정착.결과.상태이상, 병원내 장관정착.결과.증상 |
| `drafts/bacteria/VRE.md` | — | 5 | 항생제 압박 선별.effect, 항생제 압박 선별.결과.상태이상, 항생제 압박 선별.결과.증상 |
| `drafts/trematode/Schistosoma spp.md` | **52** | 4 | 세르카리아 피부침투.effect, 충란 육아종.effect, 충란 육아종.결과.효과 |

## 4. learnText 게임 용어 오염

| 노트 | 선정# | 줄 | 검출어 | 원문 |
|---|---|---|---|---|
| `drafts/bacteria/Bacteroides spp.md` | — | 65 | 으로 표현, 로 표현 | 박테로이데스속의 다른 축을 협막성 회피으로 표현한 초안이다. |
| `drafts/bacteria/Bacteroides spp.md` | — | 83 | 전용기 | 박테로이데스속 전용기는 장내 혐기성 정상균총, 복강 내 농양, 협막성 혐기성균 이미지를 가장 강하게 살리는 방향의 초안이다. |
| `drafts/bacteria/Bordetella pertussis.md` | — | 39 | 준비기 | 준비기는 감염 시작점인 섬모 상피 부착을 표현했다. |
| `drafts/bacteria/Bordetella pertussis.md` | — | 58 | 보스 | 기침 상태이상은 보스가 공격할 때마다 추가 피해를 주는 공식 상태다. |
| `drafts/bacteria/Bordetella pertussis.md` | — | 94 | 전용기 | 같은 상태이상은 누적 가능하므로 전용기는 기침 2스택 부여 후보로 둔다. |
| `drafts/bacteria/Borrelia burgdorferi.md` | — | 75 | 공식 상태이상, 으로 표현, 로 표현 | 관절통은 공식 상태이상 `통증`으로 표현했다. |
| `drafts/bacteria/Brucella spp.md` | — | 65 | 으로 표현, 로 표현 | 브루셀라속의 다른 축을 파동열으로 표현한 초안이다. |
| `drafts/bacteria/Brucella spp.md` | — | 83 | 전용기 | 브루셀라속 전용기는 작은 그람음성 coccobacilli, 동물성 감염, 파동열 이미지를 가장 강하게 살리는 방향의 초안이다. |
| `drafts/bacteria/Campylobacter jejuni.md` | — | 58 | 공식 상태이상, 으로 표현, 로 표현 | 복통은 공식 상태이상 `통증`으로 표현한다. |
| `drafts/bacteria/Campylobacter jejuni.md` | — | 75 | 공식 상태이상, 임시 | GBS는 공식 상태이상 신경 이상/마비 조합으로 임시 표현했다. |
| `drafts/bacteria/Chlamydia spp.md` | — | 39 | 준비기 | 준비기는 감염형 elementary body가 세포에 부착해 들어가는 과정을 표현했다. |
| `drafts/bacteria/Chlamydia spp.md` | — | 58 | 공식 상태이상, 임시 | 공식 상태이상 안에서는 만성/세포내 감염 부담을 피로로 임시 표현했다. |
| `drafts/bacteria/Chlamydia spp.md` | — | 77 | 공식 상태이상 | 점막 염증은 공식 상태이상 중 부종으로 우선 표현했다. |
| `drafts/bacteria/Chlamydia spp.md` | — | 94 | 로 표현, 전용기 | 전용기는 절대세포내 생활사를 전투상 무적 키워드로 표현한 초안이다. |
| `drafts/bacteria/Chlamydia trachomatis.md` | — | 39 | 로 표현, 준비기 | elementary body가 감염형으로 세포에 부착하는 과정을 준비기로 표현했다. |
| `drafts/bacteria/Chlamydia trachomatis.md` | — | 58 | 임시 | 요도염/자궁경부염 같은 국소 점막 염증은 부종으로 임시 표현했다. |
| `drafts/bacteria/Chlamydia trachomatis.md` | — | 77 | 공식 상태이상, 으로 표현, 로 표현 | 트라코마의 시야 손상은 공식 상태이상 시력 이상으로 표현한다. |
| `drafts/bacteria/Chlamydia trachomatis.md` | — | 94 | 임시 | 절대세포내 생활사는 전투상 무적 키워드로 임시 표현했다. |
| `drafts/bacteria/Clostridium perfringens.md` | — | 77 | 공식 상태이상, 으로 표현, 로 표현 | 장독소성 설사는 공식 상태이상 `배설 이상`으로 표현한다. |
| `drafts/bacteria/Clostridium perfringens.md` | — | 86 | 전용기 | Gas gangrene은 C. perfringens를 떠올리는 강한 전용기 소재다. |
| `drafts/bacteria/CRE.md` | **29** | 66 | 임시 | 면역 이상는 실제 항생제 내성과는 다르지만 전투상 방어 무력화로 임시 표현했다. |
| `drafts/bacteria/EAEC.md` | **14** | 75 | 으로 표현, 로 표현 | EAEC는 급격한 침습보다 지속적인 장 점막 자극으로 표현하기 좋다. |
| `drafts/bacteria/EAEC.md` | **14** | 102 | 으로 표현, 로 표현 | biofilm성 부착은 병원체가 쉽게 떨어지지 않는 느낌으로 표현할 수 있다. |
| `drafts/bacteria/EHEC_STEC E. coli O157_H7.md` | **15** | 102 | 임시 | HUS를 별도 상태이상으로 만들지는 않고 출혈/혈압 이상 조합으로 임시 표현했다. |
| `drafts/bacteria/EIEC.md` | **16** | 102 | 패시몬 | 병원형 이름의 invasive가 곧 이 패시몬의 핵심 컨셉이다. |
| `drafts/bacteria/Enterobacter aerogenes.md` | — | 65 | 으로 표현, 로 표현 | 에어로제네스엔테로박터균의 다른 축을 내성막 버티기으로 표현한 초안이다. |
| `drafts/bacteria/Enterobacter aerogenes.md` | — | 83 | 전용기 | 에어로제네스엔테로박터균 전용기는 장내세균과 막대균, 병원 환경 기회감염과 내성 이미지를 가장 강하게 살리는 방향의 초안이다. |
| `drafts/bacteria/Enterobacter cloacae.md` | — | 65 | 으로 표현, 로 표현 | 클로아카엔테로박터균의 다른 축을 기회감염 발열으로 표현한 초안이다. |
| `drafts/bacteria/Enterobacter cloacae.md` | — | 83 | 전용기 | 클로아카엔테로박터균 전용기는 장내세균과 막대균, 병원 환경과 의료관련 감염 이미지를 가장 강하게 살리는 방향의 초안이다. |
| `drafts/bacteria/Enterococcus faecalis.md` | — | 58 | 공식 상태이상, 으로 표현, 로 표현 | 배뇨 이상은 공식 상태이상 `배설 이상`으로 표현했다. |
| `drafts/bacteria/Enterococcus faecalis.md` | — | 75 | 으로 표현, 로 표현 | 심내막염 상태는 혈압 이상과 피로 조합으로 표현했다. |
| `drafts/bacteria/Enterococcus faecium.md` | — | 58 | 임시 | 실제 항생제 내성을 전투에서는 방어 무력화로 임시 표현했다. |
| `drafts/bacteria/EPEC.md` | **13** | 47 | 준비기, 공격기 | 부착 자체가 병인인 경우 공격기보다 준비기에서 특징을 드러내기 좋다. |
| `drafts/bacteria/Gardnerella vaginalis.md` | **58** | 73 | 으로 표현, 로 표현 | 가드네렐라균의 다른 축을 바이오필름 전환으로 표현한 초안이다. |
| `drafts/bacteria/Gardnerella vaginalis.md` | **58** | 91 | 전용기 | 가드네렐라균 전용기는 세균성 질염, clue cell, 질내 바이오필름과 정상균총 변화 이미지를 가장 강하게 살리는 방향의 초안이다. |
| `drafts/bacteria/Haemophilus influenzae.md` | — | 58 | 임시 | 수막염은 발열과 신경 이상 조합으로 임시 표현했다. |
| `drafts/bacteria/Haemophilus influenzae.md` | — | 75 | 로 표현 | 후두개염은 호흡 곤란 상태로 표현하기 좋다. |
| `drafts/bacteria/Helicobacter pylori.md` | — | 58 | 로 표현 | 위산 회피는 이 후보의 방어적 기술로 표현하기 좋다. |
| `drafts/bacteria/Helicobacter pylori.md` | — | 75 | 공식 상태이상, 으로 표현, 로 표현 | 복통/속쓰림은 공식 상태이상 `통증`으로 표현했다. |
| `drafts/bacteria/Hypervirulent Klebsiella pneumoniae.md` | **28** | 66 | 로 표현 | 농양성 병변은 발열과 부종 상태로 표현했다. |
| `drafts/bacteria/Hypervirulent Klebsiella pneumoniae.md` | **28** | 94 | 전용기 | hvKP의 hypermucoviscosity는 전용기 소재로 가장 직관적이다. |
| `drafts/bacteria/Lactobacillus spp.md` | — | 65 | 으로 표현, 로 표현 | 락토바실러스속의 다른 축을 경쟁적 배제으로 표현한 초안이다. |
| `drafts/bacteria/Lactobacillus spp.md` | — | 83 | 전용기 | 락토바실러스속 전용기는 그람양성 막대균, 젖산 생성, 질/장 정상균총 보호 이미지 이미지를 가장 강하게 살리는 방향의 초안이다. |
| `drafts/bacteria/Legionella pneumophila.md` | — | 58 | 임시 | 세포내 생존과 식포융합 차단은 면역 이상으로 임시 표현했다. |
| `drafts/bacteria/Legionella pneumophila.md` | — | 77 | 으로 표현, 로 표현 | 호흡기 침범은 기침과 호흡 곤란 조합으로 표현했다. |
| `drafts/bacteria/Moraxella catarrhalis.md` | — | 39 | 준비기 | 준비기는 상기도 정착 뒤 기회감염으로 이어지는 흐름을 표현했다. |
| `drafts/bacteria/Moraxella catarrhalis.md` | — | 58 | 공식 상태이상, 으로 표현, 로 표현 | 호흡기 증상은 공식 상태이상 기침으로 표현했다. |
| `drafts/bacteria/Moraxella catarrhalis.md` | — | 77 | 임시 | 항생제 내성 자체는 상태이상이 아니지만 전투상 면역 이상으로 임시 표현했다. |
| `drafts/bacteria/Moraxella catarrhalis.md` | — | 94 | 공식 상태이상, 으로 표현, 로 표현 | 중이염의 청각 저하는 공식 상태이상 `청력 이상`으로 표현했다. |
| `drafts/bacteria/Mycobacterium bovis.md` | — | 75 | 패시몬 | 병원체 패시몬으로 쓸지, 백신/보조 시스템 후보로 분리할지 검수 필요하다. |
| `drafts/bacteria/Mycobacterium leprae.md` | — | 58 | 으로 표현, 로 표현 | 감각 저하 상태이상은 없어 신경 이상으로 표현했다. |
| `drafts/bacteria/Mycobacterium tuberculosis.md` | **30** | 85 | 공식 상태이상, 임시 | 공식 상태이상에는 체중 감소가 없어 피로로 임시 표현했다. |
| `drafts/bacteria/Mycobacterium tuberculosis.md` | **30** | 94 | 전용기 | 결핵균은 latent infection과 재활성화 개념을 전용기 소재로 삼기 좋다. |
| `drafts/bacteria/Mycobacterium vaccae.md` | — | 65 | 으로 표현, 로 표현 | 마이코박테리움 바카이의 다른 축을 환경성 노출으로 표현한 초안이다. |
| `drafts/bacteria/Mycobacterium vaccae.md` | — | 83 | 전용기 | 마이코박테리움 바카이 전용기는 실습용 항산성균, 붉은 막대 염색, 낮은 병원성 이미지를 가장 강하게 살리는 방향의 초안이다. |
| `drafts/bacteria/Mycoplasma hominis.md` | **55** | 73 | 으로 표현, 로 표현 | 마이코플라스마 호미니스의 다른 축을 벽 없는 회피으로 표현한 초안이다. |
| `drafts/bacteria/Mycoplasma hominis.md` | **55** | 91 | 전용기 | 마이코플라스마 호미니스 전용기는 세포벽이 없는 작은 세균, 유연한 막, 비뇨생식기 점막 이미지를 가장 강하게 살리는 방향의 초안이다. |
| `drafts/bacteria/Mycoplasma spp.md` | **56** | 73 | 으로 표현, 로 표현 | 마이코플라스마속의 다른 축을 세포벽 표적 무시으로 표현한 초안이다. |
| `drafts/bacteria/Mycoplasma spp.md` | **56** | 91 | 전용기 | 마이코플라스마속 전용기는 세포벽 없는 작은 세균, 비정형 폐렴과 점막 부착 이미지를 가장 강하게 살리는 방향의 초안이다. |
| `drafts/bacteria/Neisseria gonorrhoeae.md` | — | 58 | 으로 표현, 로 표현 | 배뇨 이상은 `배설 이상`으로 표현하고, 분비물은 증상 텍스트로 남겼다. |
| `drafts/bacteria/Neisseria gonorrhoeae.md` | — | 75 | 전용기 | 수막구균과 달리 협막보다 pili 변이를 전용기로 둔다. |
| `drafts/bacteria/Neisseria meningitidis.md` | — | 58 | 으로 표현, 로 표현 | 수막염은 발열과 신경 이상 조합으로 표현한다. |
| `drafts/bacteria/Neisseria meningitidis.md` | — | 75 | 전용기 | 임균과 달리 협막을 전용기 중심에 둔다. |
| `drafts/bacteria/Nocardia spp.md` | **59** | 73 | 으로 표현, 로 표현 | 노카르디아속의 다른 축을 뇌농양 가지으로 표현한 초안이다. |
| `drafts/bacteria/Nocardia spp.md` | **59** | 91 | 전용기 | 노카르디아속 전용기는 분지성 사상형 세균, 약항산성, 토양과 폐/뇌 침범 이미지를 가장 강하게 살리는 방향의 초안이다. |
| `drafts/bacteria/Prevotella spp.md` | — | 65 | 으로 표현, 로 표현 | 프레보텔라속의 다른 축을 구강 바이오필름으로 표현한 초안이다. |
| `drafts/bacteria/Prevotella spp.md` | — | 83 | 전용기 | 프레보텔라속 전용기는 구강/질 점막 혐기성균, 혼합 감염과 농양 이미지를 가장 강하게 살리는 방향의 초안이다. |
| `drafts/bacteria/Proteus mirabilis.md` | — | 58 | 으로 표현, 로 표현 | 요로결석의 통증은 `통증`, 배뇨 이상은 `배설 이상`으로 표현했다. |
| `drafts/bacteria/Proteus mirabilis.md` | — | 75 | 으로 표현, 로 표현 | 결석 통증은 `통증`, 배뇨 이상은 `배설 이상`으로 표현했다. |
| `drafts/bacteria/Rickettsia spp.md` | — | 39 | 준비기 | 준비기는 매개체 물림 뒤 혈관내피 감염으로 이어지는 흐름을 표현했다. |
| `drafts/bacteria/Rickettsia spp.md` | — | 58 | 공식 상태이상 | 발열은 매 턴 최대 체력 기반 피해를 주는 공식 상태이상이다. |
| `drafts/bacteria/Rickettsia spp.md` | — | 94 | 전용기 | 전용기는 혈관내피 tropism을 가장 강하게 살리는 초안이다. |
| `drafts/bacteria/Salmonella bongori.md` | — | 65 | 으로 표현, 로 표현 | 봉고리살모넬라균의 다른 축을 편모 질주으로 표현한 초안이다. |
| `drafts/bacteria/Salmonella bongori.md` | — | 83 | 전용기 | 봉고리살모넬라균 전용기는 살모넬라 분류를 보여 주는 장관성 막대균 이미지를 가장 강하게 살리는 방향의 초안이다. |
| `drafts/bacteria/Salmonella enterica.md` | — | 65 | 으로 표현, 로 표현 | 장관살모넬라균의 다른 축을 대식세포 탑승으로 표현한 초안이다. |
| `drafts/bacteria/Salmonella enterica.md` | — | 83 | 전용기 | 장관살모넬라균 전용기는 운동성 그람음성 막대균, 장상피 침습, 대식세포 생존 이미지를 가장 강하게 살리는 방향의 초안이다. |
| `drafts/bacteria/Salmonella Enteritidis.md` | **20** | 85 | 로 표현 | 상태이상은 공식 목록에 맞춰 발열/배설 이상/탈수로 표현한다. |
| `drafts/bacteria/Salmonella Paratyphi.md` | **19** | 102 | 전용기 | Typhi와 비교 검수하면서 전용기 차별화가 필요하다. |
| `drafts/bacteria/Shigella dysenteriae.md` | **25** | 66 | 으로 표현, 로 표현 | 혈성 설사는 출혈 상태이상으로 표현한다. |
| `drafts/bacteria/Shigella dysenteriae.md` | **25** | 102 | 공식 상태이상, 으로 표현, 로 표현 | HUS는 공식 상태이상에 없어 출혈과 혈압 이상 조합으로 표현했다. |
| `drafts/bacteria/Shigella flexneri.md` | **23** | 94 | 전용기 | S. flexneri는 세포내 이동과 세포간 확산을 전용기 컨셉으로 삼기 좋다. |
| `drafts/bacteria/Shigella sonnei.md` | **24** | 56 | 위력 | S. sonnei도 shigellosis를 일으키지만 노트에서는 flexneri/dysenteriae보다 낮은 위력으로 구분한다. |
| `drafts/bacteria/Shigella sonnei.md` | **24** | 66 | 공식 상태이상, 으로 표현, 로 표현 | 공식 상태이상 안에서는 설사 양상을 배설 이상으로 표현한다. |
| `drafts/bacteria/Staphylococcus epidermidis.md` | — | 67 | 전용기 | S. epidermidis의 전용기는 독소보다 biofilm 지속감염이 더 적합하다. |
| `drafts/bacteria/Streptococcus agalactiae.md` | — | 58 | 임시 | 수막염/패혈증은 발열과 신경 이상 조합으로 임시 표현했다. |
| `drafts/bacteria/Treponema pallidum.md` | — | 67 | 전용기 | 매독은 잠복성과 후기 신경계 침범을 전용기 소재로 삼기 좋다. |
| `drafts/bacteria/UPEC.md` | **17** | 85 | 공식 상태이상, 으로 표현, 로 표현 | 배뇨 이상은 공식 상태이상 `배설 이상`으로 표현했다. |
| `drafts/bacteria/Ureaplasma urealyticum.md` | **57** | 73 | 으로 표현, 로 표현 | 유레아플라스마 유레아리티쿰의 다른 축을 무벽 회피으로 표현한 초안이다. |
| `drafts/bacteria/Ureaplasma urealyticum.md` | **57** | 91 | 전용기 | 유레아플라스마 유레아리티쿰 전용기는 세포벽 없는 유레아분해 세균, 비뇨생식기/양수 검사 맥락 이미지를 가장 강하게 살리는 방향의 초안이다. |
| `drafts/bacteria/Vibrio cholerae.md` | — | 67 | 전용기 | 콜레라 전용기는 직접 피해보다 탈수 누적 컨셉이 잘 어울린다. |
| `drafts/bacteria/Vibrio parahaemolyticus.md` | — | 58 | 공식 상태이상, 으로 표현, 로 표현 | 장염 증상은 공식 상태이상 배설 이상으로 표현한다. |
| `drafts/bacteria/Vibrio parahaemolyticus.md` | — | 67 | 전용기 | 염분 선호성과 해산물 매개 이미지를 전용기 컨셉으로 둔다. |
| `drafts/bacteria/Vibrio parahaemolyticus.md` | — | 75 | 위력 | 콜레라보다 낮은 위력의 해산물 장염형으로 차별화한다. |
| `drafts/bacteria/Vibrio vulnificus.md` | — | 75 | 으로 표현, 로 표현 | 패혈증 상태는 혈압 이상과 발열 조합으로 표현했다. |
| `drafts/bacteria/Viridans streptococci.md` | — | 58 | 임시 | biofilm성 부착은 전투에서 방어 특성 무력화로 임시 표현했다. |
| `drafts/bacteria/Viridans streptococci.md` | — | 75 | 로 표현 | 심내막염은 별도 상태이상 없이 혈압 이상과 피로로 표현했다. |
| `drafts/bacteria/VRE.md` | — | 58 | 로 표현 | 실제 내성 기전을 전투에서는 방어 특성 무력화로 표현했다. |
| `drafts/bacteria/VRE.md` | — | 75 | 패시몬 | CRE와 마찬가지로 내성형을 별도 패시몬으로 둘지 검수 필요하다. |
| `drafts/bacteria/Yersinia enterocolitica.md` | — | 58 | 공식 상태이상, 으로 표현, 로 표현 | 복통은 공식 상태이상 `통증`으로 표현했다. |
| `drafts/bacteria/Yersinia pseudotuberculosis.md` | — | 65 | 으로 표현, 로 표현 | 가성결핵예르시니아균의 다른 축을 가성결핵 결절으로 표현한 초안이다. |
| `drafts/bacteria/Yersinia pseudotuberculosis.md` | — | 83 | 전용기 | 가성결핵예르시니아균 전용기는 장간막 림프절염, 결핵처럼 보이는 결절성 이름 이미지를 가장 강하게 살리는 방향의 초안이다. |
| `drafts/cestode/Hymenolepis nana.md` | — | 39 | 준비기 | 준비기는 direct egg ingestion을 표현했다. |
| `drafts/cestode/Hymenolepis nana.md` | — | 58 | 공식 상태이상, 으로 표현, 로 표현 | 장관 증상은 공식 상태이상 배설 이상으로 표현했다. |
| `drafts/cestode/Hymenolepis nana.md` | — | 75 | 임시 | 자가감염 반복은 무적 키워드와 배설 이상으로 임시 표현했다. |
| `drafts/cestode/Sparganum Spirometra spp.md` | **53** | 66 | 공식 상태이상, 으로 표현, 로 표현 | 이동성 종괴의 통증은 공식 상태이상 통증으로 표현한다. |
| `drafts/cestode/Sparganum Spirometra spp.md` | **53** | 75 | 전용기 | 스파르가눔은 눈, 뇌 등 다양한 조직 침범 가능성을 전용기 소재로 삼기 좋다. |
| `drafts/cestode/Taenia saginata.md` | — | 39 | 준비기 | 준비기는 beef cysticercus ingestion을 표현했다. |
| `drafts/cestode/Taenia saginata.md` | — | 58 | 공식 상태이상, 으로 표현, 로 표현 | 장관 불편감은 공식 상태이상 배설 이상으로 표현했다. |
| `drafts/cestode/Taenia saginata.md` | — | 75 | 임시 | 조충 성충 감염은 배설 이상/피로로 임시 표현했다. |
| `drafts/fungus/Aspergillus fumigatus.md` | — | 39 | 준비기 | 준비기는 inhaled conidia를 표현했다. |
| `drafts/fungus/Aspergillus fumigatus.md` | — | 58 | 으로 표현, 로 표현 | angioinvasion은 출혈과 괴사 조합으로 표현했다. |
| `drafts/fungus/Aspergillus fumigatus.md` | — | 77 | 공식 상태이상, 으로 표현, 로 표현 | 호흡기 자극은 공식 상태이상 기침으로 표현했다. |
| `drafts/fungus/Aspergillus fumigatus.md` | — | 94 | 전용기 | 전용기는 현미경 형태와 침습성 폐 감염을 함께 살린 초안이다. |
| `drafts/fungus/Candida albicans.md` | — | 39 | 준비기 | 준비기는 내인성 기회감염의 출발점을 표현했다. |
| `drafts/fungus/Candida albicans.md` | — | 58 | 공식 상태이상, 임시 | 점막 염증은 공식 상태이상 부종으로 임시 표현했다. |
| `drafts/fungus/Candida albicans.md` | — | 77 | 임시 | biofilm의 방어 회피 이미지는 면역 이상으로 임시 표현했다. |
| `drafts/fungus/Candida albicans.md` | — | 94 | 로 표현, 전용기 | 전용기는 형태 전환을 전투상 무적 키워드로 표현한 초안이다. |
| `drafts/nematode/Angiostrongylus cantonensis.md` | — | 39 | 준비기 | 준비기는 감염 유충 섭취를 표현했다. |
| `drafts/nematode/Angiostrongylus cantonensis.md` | — | 58 | 으로 표현, 로 표현 | 호산구 증가는 면역 이상 1스택으로 표현한다. |
| `drafts/nematode/Angiostrongylus cantonensis.md` | — | 67 | 전용기 | 중추신경계로 길을 잃는 유충이행을 전용기로 살렸다. |
| `drafts/nematode/Angiostrongylus cantonensis.md` | — | 75 | 공식 상태이상, 으로 표현, 로 표현 | 두통은 공식 상태이상 `통증`으로 표현했다. |
| `drafts/nematode/Anisakis simplex.md` | **33** | 66 | 공식 상태이상, 으로 표현, 로 표현 | 급성 복통은 공식 상태이상 통증으로 표현한다. |
| `drafts/nematode/Anisakis simplex.md` | **33** | 83 | 공식 상태이상, 으로 표현, 로 표현 | 알레르기성 가려움은 공식 상태이상 가려움으로 표현한다. |
| `drafts/nematode/Brugia malayi.md` | **44** | 66 | 공식 상태이상, 으로 표현, 로 표현 | 림프부종은 공식 상태이상 부종으로 표현한다. |
| `drafts/nematode/Brugia malayi.md` | **44** | 75 | 전용기 | Brugia는 Wuchereria와 비슷하므로 전용기는 더 국소적인 림프고리 컨셉으로 둔다. |
| `drafts/nematode/Brugia timori.md` | — | 39 | 준비기 | 준비기는 mosquito-borne L3 larva entry를 표현했다. |
| `drafts/nematode/Brugia timori.md` | — | 58 | 공식 상태이상, 으로 표현, 로 표현 | 림프부종은 공식 상태이상 부종으로 표현했다. |
| `drafts/nematode/Brugia timori.md` | — | 75 | 전용기 | 전용기는 부종 2스택 후보로 둔다. |
| `drafts/nematode/Capillaria philippinensis.md` | **37** | 66 | 로 표현 | 흡수장애 상태이상은 공식 목록에 없어 배설 이상/탈수로 표현했다. |
| `drafts/nematode/Dirofilaria immitis.md` | — | 39 | 준비기 | 준비기는 mosquito-borne larva entry를 표현했다. |
| `drafts/nematode/Dirofilaria immitis.md` | — | 58 | 공식 상태이상, 으로 표현, 로 표현 | 폐결절 자극은 공식 상태이상 기침으로 표현했다. |
| `drafts/nematode/Dirofilaria immitis.md` | — | 75 | 으로 표현, 로 표현 | 심폐 부담은 기침과 호흡 곤란 조합으로 표현했다. |
| `drafts/nematode/Dracunculus medinensis.md` | **48** | 66 | 공식 상태이상, 으로 표현, 로 표현 | 통증성 수포는 공식 상태이상 통증으로 표현한다. |
| `drafts/nematode/Dracunculus medinensis.md` | **48** | 83 | 전용기 | 생활사 자체가 전용기 컨셉으로 잘 맞는다. |
| `drafts/nematode/Enterobius vermicularis.md` | **42** | 66 | 공식 상태이상, 으로 표현, 로 표현 | 항문 주위 소양감은 공식 상태이상 가려움으로 표현한다. |
| `drafts/nematode/Gnathostoma spp.md` | — | 39 | 준비기 | 준비기는 감염형 유충 섭취를 표현했다. |
| `drafts/nematode/Gnathostoma spp.md` | — | 58 | 공식 상태이상, 으로 표현, 로 표현 | 이동성 피부 병변은 공식 상태이상 부종으로 표현했다. |
| `drafts/nematode/Gnathostoma spp.md` | — | 77 | 공식 상태이상, 으로 표현, 로 표현 | 신경/눈 침범은 공식 상태이상 조합으로 표현했다. |
| `drafts/nematode/Gnathostoma spp.md` | — | 86 | 전용기 | Gnathostoma의 이동성과 머리 가시 이미지를 전용기로 살렸다. |
| `drafts/nematode/Gnathostoma spp.md` | — | 94 | 으로 표현, 로 표현 | 통증은 턴 피해, 호산구 증가는 면역 이상 1스택으로 표현한다. |
| `drafts/nematode/Loa loa.md` | **46** | 66 | 공식 상태이상, 으로 표현, 로 표현 | 이동성 부종은 공식 상태이상 부종으로 표현한다. |
| `drafts/nematode/Mansonella spp.md` | — | 39 | 준비기 | 준비기는 vector-borne filarial entry를 표현했다. |
| `drafts/nematode/Mansonella spp.md` | — | 58 | 임시 | 가벼운 만성 감염은 피로로 임시 표현했다. |
| `drafts/nematode/Mansonella spp.md` | — | 77 | 공식 상태이상, 으로 표현, 로 표현 | 가려움/피부 자극은 공식 상태이상 가려움으로 표현한다. |
| `drafts/nematode/Mansonella spp.md` | — | 94 | 임시 | 저강도 지속감염은 전투상 무적 키워드로 임시 표현했다. |
| `drafts/nematode/Necator americanus.md` | **41** | 83 | 위력 | Necator는 두비니구충보다 낮은 위력, 지속형 컨셉으로 차별화했다. |
| `drafts/nematode/Onchocerca volvulus.md` | **45** | 66 | 공식 상태이상, 으로 표현, 로 표현 | 피부 소양감은 공식 상태이상 가려움으로 표현한다. |
| `drafts/nematode/Onchocerca volvulus.md` | **45** | 83 | 공식 상태이상, 으로 표현, 로 표현 | river blindness는 공식 상태이상 `시력 이상`으로 표현한다. |
| `drafts/nematode/Strongyloides stercoralis.md` | **39** | 83 | 전용기 | 과감염은 이 후보의 전용기 컨셉으로 가장 적합하다. |
| `drafts/nematode/Thelazia callipaeda.md` | **47** | 66 | 공식 상태이상, 으로 표현, 로 표현 | 눈 자극은 공식 상태이상 `시력 이상`으로 표현한다. |
| `drafts/nematode/Toxocara canis.md` | **34** | 66 | 으로 표현, 로 표현 | 호산구 증가는 면역 이상 1스택으로 표현한다. |
| `drafts/nematode/Toxocara canis.md` | **34** | 83 | 공식 상태이상, 으로 표현, 로 표현 | 눈 침범은 공식 상태이상 `시력 이상`으로 표현한다. |
| `drafts/nematode/Toxocara cati.md` | — | 39 | 준비기 | 준비기는 embryonated egg ingestion을 표현했다. |
| `drafts/nematode/Toxocara cati.md` | — | 58 | 으로 표현, 로 표현 | 호산구 증가는 면역 이상 1스택으로 표현한다. |
| `drafts/nematode/Toxocara cati.md` | — | 75 | 공식 상태이상, 으로 표현, 로 표현 | 눈 침범은 공식 상태이상 시력 이상으로 표현했다. |
| `drafts/nematode/Trichinella spiralis.md` | **38** | 66 | 공식 상태이상, 으로 표현, 로 표현 | 근육통은 공식 상태이상 통증으로 표현한다. |
| `drafts/nematode/Trichinella spiralis.md` | **38** | 75 | 전용기 | Trichinella 유충은 nurse cell/근육 낭종 이미지가 강한 전용기 소재다. |
| `drafts/nematode/Trichinella spiralis.md` | **38** | 83 | 패시몬 | 사용자 설계처럼 유충-성충을 별도 패시몬 노트로 나누기 좋은 후보이다. |
| `drafts/nematode/Trichuris trichiura.md` | **35** | 66 | 로 표현 | 설사/점액변 양상은 배설 이상 상태로 표현한다. |
| `drafts/nematode/Trichuris trichiura.md` | **35** | 83 | 공식 상태이상, 로 표현 | 직장탈출 자체는 공식 상태이상이 아니므로 출혈/피로로 표현했다. |
| `drafts/nematode/Wuchereria bancrofti.md` | **43** | 66 | 공식 상태이상 | 부종은 림프사상충 전용 표현에 가장 잘 맞는 공식 상태이상이다. |
| `drafts/nematode/Wuchereria bancrofti.md` | **43** | 83 | 으로 표현, 로 표현 | 만성 림프 폐쇄는 단발 공격보다 누적 상태이상으로 표현하기 좋다. |
| `drafts/protozoa/Entamoeba histolytica.md` | — | 39 | 준비기 | 준비기는 cyst ingestion과 excystation을 표현했다. |
| `drafts/protozoa/Entamoeba histolytica.md` | — | 58 | 으로 표현, 로 표현 | 혈성 설사는 출혈과 배설 이상 조합으로 표현한다. |
| `drafts/protozoa/Entamoeba histolytica.md` | — | 77 | 공식 상태이상, 로 표현 | 간농양은 공식 상태이상 안에서 발열/피로로 표현했다. |
| `drafts/protozoa/Entamoeba histolytica.md` | — | 94 | 로 표현, 전용기 | 전용기는 병리학적 플라스크 모양 궤양을 괴사/출혈로 표현했다. |
| `drafts/protozoa/Leishmania spp.md` | — | 39 | 준비기 | 준비기는 promastigote가 피부로 들어오는 경로를 표현했다. |
| `drafts/protozoa/Leishmania spp.md` | — | 58 | 임시 | 대식세포 내 생존은 면역 이상으로 임시 표현했다. |
| `drafts/protozoa/Leishmania spp.md` | — | 77 | 공식 상태이상, 임시 | 궤양은 공식 상태이상 중 괴사로 임시 표현했다. |
| `drafts/protozoa/Leishmania spp.md` | — | 94 | 로 표현 | 내장형 리슈마니아증의 전신 소모 이미지는 발열/피로로 표현했다. |
| `drafts/protozoa/Plasmodium spp.md` | — | 39 | 준비기 | 준비기는 sporozoite 주입과 간 단계 시작을 표현했다. |
| `drafts/protozoa/Plasmodium spp.md` | — | 75 | 임시 | 말라리아 발열 주기는 발열 2스택으로 임시 표현했다. |
| `drafts/protozoa/Toxoplasma gondii.md` | — | 39 | 준비기 | 준비기는 섭취 경로와 세포내 정착을 표현했다. |
| `drafts/protozoa/Toxoplasma gondii.md` | — | 58 | 공식 상태이상, 임시 | 만성 잠복 부담은 공식 상태이상 피로로 임시 표현했다. |
| `drafts/protozoa/Toxoplasma gondii.md` | — | 77 | 으로 표현, 로 표현 | 눈 침범은 시력 이상, 뇌 침범은 신경 이상으로 표현했다. |
| `drafts/protozoa/Toxoplasma gondii.md` | — | 94 | 으로 표현, 로 표현 | 선천감염의 chorioretinitis/CNS 포인트를 상태이상 조합으로 표현했다. |
| `drafts/trematode/Alaria.md` | — | 39 | 준비기 | 준비기는 unusual food-borne larval infection을 표현했다. |
| `drafts/trematode/Alaria.md` | — | 58 | 임시 | 조직 이행 증상은 피로/부종으로 임시 표현했다. |
| `drafts/trematode/Alaria.md` | — | 75 | 임시 | 중증 조직 이행 가능성은 신경 이상/호흡 곤란으로 임시 표현했다. |
| `drafts/trematode/Clonorchis sinensis.md` | **49** | 66 | 공식 상태이상, 로 표현 | 담관 폐쇄와 황달은 공식 상태이상 황달로 표현한다. |
| `drafts/trematode/Clonorchis sinensis.md` | **49** | 83 | 임시 | 암 자체를 상태이상으로 만들지 않고 괴사로 임시 표현했다. |
| `drafts/trematode/Echinostoma.md` | — | 39 | 준비기 | 준비기는 metacercaria 섭취를 표현했다. |
| `drafts/trematode/Echinostoma.md` | — | 58 | 으로 표현, 로 표현 | 장점막 손상은 배설 이상/출혈 조합으로 표현했다. |
| `drafts/trematode/Echinostoma.md` | — | 67 | 전용기 | 전용기는 collar spine 형태를 가장 강하게 살린 초안이다. |
| `drafts/trematode/Echinostoma.md` | — | 75 | 로 표현 | 설사성 장관 증상은 배설 이상과 탈수로 표현했다. |
| `drafts/trematode/Fasciola gigantica.md` | — | 39 | 준비기 | 준비기는 metacercaria 섭취를 표현했다. |
| `drafts/trematode/Fasciola gigantica.md` | — | 58 | 으로 표현, 로 표현 | 호산구 증가는 면역 이상, 복통은 통증으로 표현한다. |
| `drafts/trematode/Fasciola gigantica.md` | — | 75 | 공식 상태이상, 로 표현 | 담도 폐쇄와 황달은 공식 상태이상 황달로 표현한다. |
| `drafts/trematode/Fasciola hepatica.md` | **50** | 75 | 전용기 | Fasciola 성충은 담관에 정착하지만, 전용기는 큰 흡충의 물리적 장악감으로 잡는다. |
| `drafts/trematode/Fasciola hepatica.md` | **50** | 83 | 공식 상태이상, 로 표현 | 담관 폐쇄와 황달은 공식 상태이상 황달로 표현한다. |
| `drafts/trematode/Heterophyes.md` | — | 39 | 준비기 | 준비기는 metacercaria 섭취를 표현했다. |
| `drafts/trematode/Heterophyes.md` | — | 58 | 으로 표현, 로 표현 | 설사/복부불편감은 배설 이상으로 표현했다. |
| `drafts/trematode/Heterophyes.md` | — | 75 | 임시 | 장관 흡충 증상은 배설 이상/탈수 조합으로 임시 표현했다. |
| `drafts/trematode/Metagonimus.md` | — | 39 | 준비기 | 준비기는 생선 매개 감염을 표현했다. |
| `drafts/trematode/Metagonimus.md` | — | 58 | 으로 표현, 로 표현 | 장관 자극은 배설 이상으로 표현한다. |
| `drafts/trematode/Metagonimus.md` | — | 75 | 임시 | 반복 장관 자극은 배설 이상/피로로 임시 표현했다. |
| `drafts/trematode/Opisthorchis spp.md` | — | 39 | 준비기 | 준비기는 metacercaria 섭취를 표현했다. |
| `drafts/trematode/Opisthorchis spp.md` | — | 58 | 공식 상태이상, 로 표현 | 담관 자극으로 생기는 황달은 공식 상태이상 황달로 표현한다. |
| `drafts/trematode/Opisthorchis spp.md` | — | 75 | 임시 | 암 위험 자체는 상태이상이 아니므로 괴사/피로로 임시 표현했다. |
| `drafts/trematode/Paragonimus westermani.md` | **51** | 83 | 공식 상태이상, 으로 표현, 로 표현 | 객혈은 공식 상태이상에서 출혈과 기침 조합으로 표현한다. |
| `drafts/trematode/Schistosoma spp.md` | **52** | 47 | 공식 상태이상, 으로 표현, 로 표현 | Swimmer's itch는 공식 상태이상 가려움으로 표현한다. |
| `drafts/trematode/Schistosoma spp.md` | **52** | 83 | 으로 표현, 로 표현 | 방광혈뇨/문맥고혈압 이미지를 출혈과 혈압 이상으로 표현했다. |
| `drafts/virus/Adenovirus.md` | — | 39 | 준비기 | 준비기는 비외피 바이러스의 안정성을 표현했다. |
| `drafts/virus/Adenovirus.md` | — | 58 | 공식 상태이상, 으로 표현, 로 표현 | 결막염/각결막염은 공식 상태이상 시력 이상으로 표현했다. |
| `drafts/virus/Adenovirus.md` | — | 77 | 공식 상태이상, 으로 표현, 로 표현 | 장염은 공식 상태이상 배설 이상으로 표현했다. |
| `drafts/virus/Adenovirus.md` | — | 94 | 임시 | 비외피 안정성은 무적 키워드로 임시 표현했다. |
| `drafts/virus/EBV.md` | — | 39 | 준비기 | 준비기는 타액 전파와 B세포 표적성을 표현했다. |
| `drafts/virus/EBV.md` | — | 58 | 공식 상태이상, 로 표현 | 전염단핵구증의 피로감은 공식 상태이상 피로로 표현했다. |
| `drafts/virus/EBV.md` | — | 77 | 임시 | 잠복과 면역 회피 이미지는 면역 이상으로 임시 표현했다. |
| `drafts/virus/EBV.md` | — | 94 | 공식 상태이상, 임시 | 림프절 종대는 공식 상태이상 부종으로 임시 표현했다. |
| `drafts/virus/HCMV.md` | — | 39 | 준비기 | 준비기는 herpesvirus의 잠복성과 느린 확산을 표현했다. |
| `drafts/virus/HCMV.md` | — | 58 | 임시 | 거대세포 변화 자체는 상태이상이 아니므로 피로로 임시 표현했다. |
| `drafts/virus/HCMV.md` | — | 77 | 공식 상태이상, 으로 표현, 로 표현 | 망막염은 공식 상태이상 시력 이상으로 표현했다. |
| `drafts/virus/HCMV.md` | — | 94 | 으로 표현, 로 표현 | 선천감염의 청각/신경/망막 포인트는 청력 이상, 신경 이상, 시력 이상으로 표현했다. |
| `drafts/virus/Hepatitis viruses.md` | — | 39 | 준비기 | 준비기는 HAV/HEV와 HBV/HCV/HDV 전파 차이를 한 노트에 묶은 초안이다. |
| `drafts/virus/Hepatitis viruses.md` | — | 58 | 공식 상태이상, 로 표현 | 간염의 황달은 공식 상태이상 황달로 표현한다. |
| `drafts/virus/Hepatitis viruses.md` | — | 77 | 공식 상태이상, 임시 | 간경변/문맥압 같은 축은 공식 상태이상 혈압 이상으로 임시 표현했다. |
| `drafts/virus/Hepatitis viruses.md` | — | 94 | 임시 | serology 패턴 변화는 전투상 무적 키워드로 임시 표현했다. |
| `drafts/virus/HSV.md` | — | 39 | 준비기 | 준비기는 피부/점막 감염 뒤 신경절 잠복으로 이어지는 흐름이다. |
| `drafts/virus/HSV.md` | — | 58 | 공식 상태이상, 으로 표현, 로 표현 | 아픈 수포는 공식 상태이상 통증으로 표현한다. |
| `drafts/virus/HSV.md` | — | 77 | 으로 표현, 로 표현 | 뇌염은 신경 이상과 발열 조합으로 표현했다. |
| `drafts/virus/HSV.md` | — | 94 | 임시 | 잠복감염은 전투상 무적 키워드로 임시 표현했다. |
| `drafts/virus/Influenza virus.md` | — | 39 | 준비기 | 준비기는 hemagglutinin-mediated attachment를 표현했다. |
| `drafts/virus/Influenza virus.md` | — | 58 | 공식 상태이상, 으로 표현, 로 표현 | 근육통은 공식 상태이상 `통증`으로 표현했다. |
| `drafts/virus/Influenza virus.md` | — | 77 | 임시 | 항원 변화는 면역 이상으로 임시 표현했다. |
| `drafts/virus/Influenza virus.md` | — | 94 | 전용기 | 전용기는 분절 유전체와 대유행 가능성을 함께 살린 초안이다. |
| `drafts/virus/LCMV.md` | — | 39 | 준비기 | 준비기는 흡입/노출 뒤 전신 감염으로 이어지는 흐름을 표현했다. |
| `drafts/virus/LCMV.md` | — | 58 | 임시 | 수막염은 발열과 신경 이상 조합으로 임시 표현했다. |
| `drafts/virus/LCMV.md` | — | 75 | 전용기 | 전용기는 CNS 침범 이미지를 가장 강하게 살린 초안이다. |
| `drafts/virus/Measles.md` | — | 39 | 준비기 | 준비기는 airborne transmission을 표현했다. |
| `drafts/virus/Measles.md` | — | 75 | 공식 상태이상, 으로 표현, 로 표현 | 면역 기억 약화는 공식 상태이상 면역 이상으로 표현했다. |
| `drafts/virus/Norovirus.md` | — | 39 | 준비기 | 준비기는 분변-경구/오염식품 전파를 표현했다. |
| `drafts/virus/Norovirus.md` | — | 58 | 공식 상태이상 | 구토는 체력 회복량을 줄이는 공식 상태이상이다. |
| `drafts/virus/Norovirus.md` | — | 77 | 로 표현 | 설사는 배설 이상, 수분 손실은 탈수로 표현한다. |
| `drafts/virus/Norovirus.md` | — | 94 | 전용기 | 전용기는 구토 2스택과 탈수로 집단 위장관염을 표현했다. |
| `drafts/virus/Poliovirus.md` | — | 39 | 준비기 | 준비기는 enteric replication을 표현했다. |
| `drafts/virus/Poliovirus.md` | — | 58 | 공식 상태이상, 로 표현 | 이완성 마비는 공식 상태이상 마비로 표현한다. |
| `drafts/virus/Poliovirus.md` | — | 75 | 전용기 | 전용기는 마비 2스택으로 급성 이완성 마비를 표현했다. |
| `drafts/virus/Rabies.md` | — | 39 | 준비기 | 준비기는 bite exposure와 peripheral nerve entry를 표현했다. |
| `drafts/virus/Rabies.md` | — | 58 | 공식 상태이상, 으로 표현, 로 표현 | 신경계 침범은 공식 상태이상 신경 이상으로 표현했다. |
| `drafts/virus/Rabies.md` | — | 75 | 공식 상태이상, 로 표현 | 공수증/연하곤란은 공식 상태이상 안에서 신경 이상과 마비로 표현했다. |
| `drafts/virus/Rotavirus.md` | — | 39 | 준비기 | 준비기는 소아 장관 감염의 시작점을 표현했다. |
| `drafts/virus/Rotavirus.md` | — | 58 | 로 표현 | 설사는 배설 이상, 수분 손실은 탈수로 표현한다. |
| `drafts/virus/Rotavirus.md` | — | 75 | 공식 상태이상, 으로 표현, 로 표현 | 소아 급성 위장관염 증상을 공식 상태이상 조합으로 표현했다. |
| `drafts/virus/SARS-CoV-2.md` | — | 39 | 준비기 | 준비기는 바이러스 부착/진입을 표현했다. |
| `drafts/virus/SARS-CoV-2.md` | — | 58 | 으로 표현, 로 표현 | 호흡기 증상은 기침과 호흡 곤란 조합으로 표현했다. |
| `drafts/virus/SARS-CoV-2.md` | — | 77 | 공식 상태이상, 임시 | 응고/혈관 이상은 공식 상태이상 중 혈압 이상으로 임시 표현했다. |
| `drafts/virus/SARS-CoV-2.md` | — | 94 | 임시 | 항원 변화/면역 회피 이미지는 면역 이상으로 임시 표현했다. |

## 5. 3축 합계 이탈 (STATS §5: 120~250)

| 노트 | 선정# | HP | 공격 | 방어 | 합 |
|---|---|---:|---:|---:|---:|
| `drafts/bacteria/Bacteroides spp.md` | — | NaN | NaN | NaN | 파싱불가 |
| `drafts/bacteria/Brucella spp.md` | — | NaN | NaN | NaN | 파싱불가 |
| `drafts/bacteria/Enterobacter aerogenes.md` | — | NaN | NaN | NaN | 파싱불가 |
| `drafts/bacteria/Enterobacter cloacae.md` | — | NaN | NaN | NaN | 파싱불가 |
| `drafts/bacteria/Lactobacillus spp.md` | — | NaN | NaN | NaN | 파싱불가 |
| `drafts/bacteria/Mycobacterium vaccae.md` | — | NaN | NaN | NaN | 파싱불가 |
| `drafts/bacteria/Prevotella spp.md` | — | NaN | NaN | NaN | 파싱불가 |
| `drafts/bacteria/Salmonella bongori.md` | — | NaN | NaN | NaN | 파싱불가 |
| `drafts/bacteria/Salmonella enterica.md` | — | NaN | NaN | NaN | 파싱불가 |
| `drafts/bacteria/Yersinia pseudotuberculosis.md` | — | NaN | NaN | NaN | 파싱불가 |
| `drafts/bacteria/Hypervirulent Klebsiella pneumoniae.md` | **28** | 92 | 82 | 82 | 256 |
| `Bacillus anthracis.md` | **1** | 100 | 100 | 100 | 300 |

## 6. 출처 강의 공란

74개 노트. (강의 폴더: `인하대 의대/claude/lectures/Infection Immune/` — 실제 60강, WORKFLOW §0에는 01~40강으로 적혀 있음)

- — `drafts/bacteria/Bacteroides spp.md`
- — `drafts/bacteria/Bordetella pertussis.md`
- — `drafts/bacteria/Borrelia burgdorferi.md`
- — `drafts/bacteria/Brucella spp.md`
- — `drafts/bacteria/Campylobacter jejuni.md`
- — `drafts/bacteria/Chlamydia spp.md`
- — `drafts/bacteria/Chlamydia trachomatis.md`
- — `drafts/bacteria/Clostridium perfringens.md`
- — `drafts/bacteria/Enterobacter aerogenes.md`
- — `drafts/bacteria/Enterobacter cloacae.md`
- — `drafts/bacteria/Enterococcus faecalis.md`
- — `drafts/bacteria/Enterococcus faecium.md`
- — `drafts/bacteria/Haemophilus influenzae.md`
- — `drafts/bacteria/Helicobacter pylori.md`
- — `drafts/bacteria/Lactobacillus spp.md`
- — `drafts/bacteria/Legionella pneumophila.md`
- — `drafts/bacteria/Moraxella catarrhalis.md`
- — `drafts/bacteria/Mycobacterium bovis.md`
- — `drafts/bacteria/Mycobacterium leprae.md`
- — `drafts/bacteria/Mycobacterium vaccae.md`
- — `drafts/bacteria/Neisseria gonorrhoeae.md`
- — `drafts/bacteria/Neisseria meningitidis.md`
- — `drafts/bacteria/Prevotella spp.md`
- — `drafts/bacteria/Proteus mirabilis.md`
- — `drafts/bacteria/Pseudomonas aeruginosa.md`
- — `drafts/bacteria/Rickettsia spp.md`
- — `drafts/bacteria/Salmonella bongori.md`
- — `drafts/bacteria/Salmonella enterica.md`
- — `drafts/bacteria/Serratia marcescens.md`
- — `drafts/bacteria/Staphylococcus epidermidis.md`
- — `drafts/bacteria/Streptococcus agalactiae.md`
- — `drafts/bacteria/Treponema pallidum.md`
- — `drafts/bacteria/Vibrio cholerae.md`
- — `drafts/bacteria/Vibrio parahaemolyticus.md`
- — `drafts/bacteria/Vibrio vulnificus.md`
- — `drafts/bacteria/Viridans streptococci.md`
- — `drafts/bacteria/VRE.md`
- — `drafts/bacteria/Yersinia enterocolitica.md`
- — `drafts/bacteria/Yersinia pseudotuberculosis.md`
- — `drafts/cestode/Hymenolepis nana.md`
- — `drafts/cestode/Taenia saginata.md`
- — `drafts/fungus/Aspergillus fumigatus.md`
- — `drafts/fungus/Candida albicans.md`
- — `drafts/nematode/Angiostrongylus cantonensis.md`
- — `drafts/nematode/Brugia timori.md`
- — `drafts/nematode/Dirofilaria immitis.md`
- — `drafts/nematode/Gnathostoma spp.md`
- — `drafts/nematode/Mansonella spp.md`
- — `drafts/nematode/Toxocara cati.md`
- — `drafts/protozoa/Entamoeba histolytica.md`
- — `drafts/protozoa/Leishmania spp.md`
- — `drafts/protozoa/Plasmodium spp.md`
- — `drafts/protozoa/Toxoplasma gondii.md`
- — `drafts/trematode/Alaria.md`
- — `drafts/trematode/Echinostoma.md`
- — `drafts/trematode/Fasciola gigantica.md`
- — `drafts/trematode/Heterophyes.md`
- — `drafts/trematode/Metagonimus.md`
- — `drafts/trematode/Opisthorchis spp.md`
- — `drafts/virus/Adenovirus.md`
- — `drafts/virus/EBV.md`
- — `drafts/virus/HCMV.md`
- — `drafts/virus/Hepatitis viruses.md`
- — `drafts/virus/HSV.md`
- — `drafts/virus/Influenza virus.md`
- — `drafts/virus/LCMV.md`
- — `drafts/virus/Measles.md`
- — `drafts/virus/Norovirus.md`
- — `drafts/virus/Poliovirus.md`
- — `drafts/virus/Rabies.md`
- — `drafts/virus/Rotavirus.md`
- — `drafts/virus/SARS-CoV-2.md`
- **1** `Bacillus anthracis.md`
- **2** `Bacillus cereus.md`

## 7. evasion 후보 — 현 `방어특성:` 값별 빈도

VOCAB **v2.1** 기준(§2-3 evasion 18종 + §2-5 정규화표 + §2-6 이관표). `현 파서 처리`는 `data/pathimonNoteParser.ts:247` `ABILITY_BY_NOTE_VALUE` 가 실제로 뱉는 값이다.

**미해결 0종** — VOCAB v2.1이 73종을 전부 커버한다.

| 방어특성 값 | 사용 | VOCAB v2.1 처리 | 현 파서 처리 |
|---|---:|---|---|
| 바이오필름 | 11 | §2-5 → `생물막` | `biofilm` |
| 세포내생존 | 10 | §2-5 → `세포내은신` | `phagolysosome_block` |
| 아포 | 6 | 정식 값 | `spore` |
| 협막 | 6 | 정식 값 | `capsule` |
| 부착선모 | 4 | §2-6 → 기술/학습포인트 | `epithelial_barrier` |
| 산저항 | 4 | §2-5 → `위산저항` | `acidfast` |
| 무세포벽 | 3 | §2-5 → `세포벽없음` | `barrier` |
| 유충이행 | 3 | 정식 값 | `large_resistance` |
| 자가감염 | 3 | 정식 값 | `large_resistance` |
| 조직이행 | 3 | §2-6 → location | `large_resistance` |
| 항원변이 | 3 | 정식 값 | **미매핑 → `none`** |
| 간이행 | 2 | §2-6 → location | `large_resistance` |
| 내성 | 2 | §2-5 → `내성효소` | **미매핑 → `none`** |
| 담관정착 | 2 | §2-6 → location | `large_resistance` |
| 림프정착 | 2 | §2-6 → location | `antigen_disguise` |
| 세포내침입 | 2 | §2-5 → `세포내은신` | `phagolysosome_block` |
| 장점막부착 | 2 | §2-6 → 기술/학습포인트 | **미매핑 → `none`** |
| 피하이동 | 2 | §2-6 → location | `large_resistance` |
| 항산성막 | 2 | §2-5 → `항산성` | `acidfast` |
| 흡혈 | 2 | §2-6 → 학습포인트 | `large_resistance` |
| 간실질이행 | 1 | §2-6 → location | **미매핑 → `none`** |
| 과점액협막 | 1 | §2-5 → `협막` | `capsule` |
| 근육낭종 | 1 | §2-5 → `낭종` | `large_resistance` |
| 낭미충 | 1 | §2-5 → `낭종` | `large_resistance` |
| 내성효소 | 1 | 정식 값 | `antitoxin` |
| 눈기생 | 1 | §2-6 → location | `large_resistance` |
| 대식세포생존 | 1 | §2-5 → `세포내은신` | **미매핑 → `none`** |
| 대형저항 | 1 | §2-6 → 폐기 | `large_resistance` |
| 두관극부착 | 1 | §2-6 → 기술/학습포인트 | **미매핑 → `none`** |
| 림프잠복 | 1 | §2-5 → `잠복` | **미매핑 → `none`** |
| 만성화 | 1 | §2-5 → `잠복` | **미매핑 → `none`** |
| 면역기억소거 | 1 | §2-6 → 학습포인트 | **미매핑 → `none`** |
| 면역회피 | 1 | §2-5 → `보체회피` | **미매핑 → `none`** |
| 미세호기성 | 1 | §2-6 → 폐기 | **미매핑 → `none`** |
| 반코마이신내성 | 1 | §2-5 → `내성효소` | **미매핑 → `none`** |
| 비외피안정성 | 1 | §2-5 → `환경저항` | **미매핑 → `none`** |
| 산저항성 | 1 | §2-5 → `위산저항` | **미매핑 → `none`** |
| 섬모부착 | 1 | §2-6 → 기술/학습포인트 | **미매핑 → `none`** |
| 스파이크변이 | 1 | §2-5 → `항원변이` | **미매핑 → `none`** |
| 식포융합차단 | 1 | §2-5 → `세포내은신` | **미매핑 → `none`** |
| 신경이행 | 1 | §2-6 → location | **미매핑 → `none`** |
| 신경절잠복 | 1 | §2-5 → `잠복` | **미매핑 → `none`** |
| 신경축삭이동 | 1 | §2-6 → location | **미매핑 → `none`** |
| 염분선호 | 1 | §2-6 → 폐기 | **미매핑 → `none`** |
| 위막장벽 | 1 | §2-6 → 기술/학습포인트 | `barrier` |
| 유레아제 | 1 | §2-6 → 학습포인트 | **미매핑 → `none`** |
| 이중캡시드 | 1 | §2-5 → `환경저항` | **미매핑 → `none`** |
| 잠복 | 1 | 정식 값 | `latency` |
| 잠복감염 | 1 | §2-5 → `잠복` | **미매핑 → `none`** |
| 장점막고정 | 1 | §2-6 → 기술/학습포인트 | `large_resistance` |
| 저강도지속감염 | 1 | §2-5 → `잠복` | **미매핑 → `none`** |
| 저온증식 | 1 | §2-6 → 폐기 | **미매핑 → `none`** |
| 적혈구잠복 | 1 | §2-5 → `잠복` | **미매핑 → `none`** |
| 접촉전파 | 1 | §2-6 → 학습포인트 | `large_resistance` |
| 정상균총 | 1 | §2-6 → 폐기 | **미매핑 → `none`** |
| 조직낭종 | 1 | §2-5 → `낭종` | **미매핑 → `none`** |
| 조직침습 | 1 | §2-6 → location | **미매핑 → `none`** |
| 지속감염 | 1 | §2-5 → `잠복` | **미매핑 → `none`** |
| 철획득 | 1 | 정식 값 | **미매핑 → `none`** |
| 편모운동 | 1 | §2-6 → 학습포인트 | **미매핑 → `none`** |
| 편절분리 | 1 | §2-6 → 학습포인트 | **미매핑 → `none`** |
| 폐낭종 | 1 | §2-5 → `낭종` | `large_resistance` |
| 포식소체성숙차단 | 1 | §2-5 → `세포내은신` | `phagolysosome_block` |
| 포자분산 | 1 | §2-5 → `환경저항` | **미매핑 → `none`** |
| 피하결절 | 1 | §2-6 → location | `large_resistance` |
| 항원위장 | 1 | 정식 값 | `antigen_disguise` |
| 혈관잠복 | 1 | §2-5 → `잠복` | **미매핑 → `none`** |
| 형태전환 | 1 | §2-5 → `항원변이` | **미매핑 → `none`** |
| 환경저항성 | 1 | §2-5 → `환경저항` | **미매핑 → `none`** |
| B세포잠복 | 1 | §2-5 → `잠복` | **미매핑 → `none`** |
| F1협막 | 1 | §2-5 → `협막` | `capsule` |
| M단백 | 1 | §2-5 → `보체회피` | `comp_evade` |
| Vi협막 | 1 | §2-5 → `협막` | `capsule` |

## 8. 대처법 약제 → VOCAB §6 처치계열 매핑

| 약제/처치 | 사용 | 계열 |
|---|---:|---|
| 알벤다졸 | 16 | 항기생충제 |
| 세프트리악손 | 13 | 세포벽억제 |
| 시프로플록사신 | 13 | 핵산합성억제 |
| 아지스로마이신 | 12 | 단백합성억제 |
| 메벤다졸 | 9 | 항기생충제 |
| 독시사이클린 | 8 | 단백합성억제 |
| 이버멕틴 | 6 | 항기생충제 |
| 트리메토프림-설파메톡사졸 | 5 | 엽산대사억제 |
| 반코마이신 | 4 | 세포벽억제 |
| 수술적 제거 | 4 | 물리제거 |
| 페니실린 | 4 | 세포벽억제 |
| 프라지콴텔 | 4 | 항기생충제 |
| 플루오로퀴놀론 | 4 | 핵산합성억제 |
| 괴사조직 제거 | 3 | 물리제거 |
| 디에틸카바마진 | 3 | 항기생충제 |
| 상처 처치 | 3 | **미매핑** |
| 클린다마이신 | 3 | 단백합성억제 |
| 겐타마이신 | 2 | 단백합성억제 |
| 니트로푸란토인 | 2 | 핵산합성억제 |
| 리팍시민 | 2 | 핵산합성억제 |
| 마크로라이드 | 2 | 단백합성억제 |
| 메트로니다졸 | 2 | 핵산합성억제 |
| 배농 | 2 | 물리제거 |
| 철분 보충 | 2 | 지지요법 |
| 충체 제거 | 2 | 물리제거 |
| 카바페넴 | 2 | 세포벽억제 |
| 트리클라벤다졸 | 2 | 항기생충제 |
| 피페라실린-타조박탐 | 2 | 세포벽억제 |
| 결절절제 | 1 | 물리제거 |
| 나프실린 | 1 | 세포벽억제 |
| 내시경 제거 | 1 | 물리제거 |
| 니클로사마이드 | 1 | 항기생충제 |
| 디프테리아 항독소 | 1 | 항독소 |
| 리네졸리드 | 1 | 단백합성억제 |
| 리팜핀 | 1 | 핵산합성억제 |
| 메로페넴-바보박탐 | 1 | 세포벽억제 |
| 물리적 제거 | 1 | 물리제거 |
| 보툴리눔 항독소 | 1 | 항독소 |
| 분변미생물 이식 | 1 | **미매핑** |
| 세파졸린 | 1 | 세포벽억제 |
| 세프타지딤-아비박탐 | 1 | 세포벽억제 |
| 세피데로콜 | 1 | **미매핑** |
| 스트렙토마이신 | 1 | 단백합성억제 |
| 아미노글리코사이드 | 1 | 단백합성억제 |
| 아미카신 | 1 | 단백합성억제 |
| 암피실린 | 1 | 세포벽억제 |
| 에리스로마이신 | 1 | 단백합성억제 |
| 에탐부톨 | 1 | 항결핵제 |
| 이미페넴 | 1 | 세포벽억제 |
| 이소니아지드 | 1 | 항결핵제 |
| 탄저 항독소 | 1 | 항독소 |
| 파상풍 면역글로불린 | 1 | 항독소 |
| 폴리믹신 | 1 | 세포막공격 |
| 피닥소마이신 | 1 | 핵산합성억제 |
| 피라진아미드 | 1 | 항결핵제 |
| 피란텔 | 1 | 항기생충제 |
| 항레트로바이러스제 | 1 | 항바이러스제 |
| ART | 1 | 항바이러스제 |

미매핑 3종 — VOCAB §6 확장 또는 표기 정규화 대상.

## 9. `claudecode/기생충 목요일ver.pdf` 대조

PDF 수록 범위: **선충류 15항(+하위 1) · 흡충류 6항**. 조충류 절(節)은 PDF에 없다.
기생충 노트 작성 시 이 PDF를 강의록과 함께 참조한다(감염경로·감염형·기생부위·이행경로·진단형·치료제가 항목별로 정리돼 있어 `학습포인트` 4카테고리와 대응이 좋다).

### 9-1. PDF에 있으나 59종에 없는 기생충

| PDF 항목 | 학명 | drafts 초안 | 상태 |
|---|---|---|---|
| 3-1) 브라질구충 / 개구충 | *Ancylostoma braziliense*, *A. caninum* | **없음** | 신규 작성 필요. 피부유충이행증(CLM) — 유충이 epidermo-dermal junction을 못 넘어 표피에서만 이동하는 것이 감별점 |
| 11) 유극악구충 | *Gnathostoma spinigerum* | `drafts/nematode/Gnathostoma spp.md` | 초안 있음, **59종 미선정** |
| 2) 요코가와흡충 | *Metagonimus yokogawai* | `drafts/trematode/Metagonimus.md` | 초안 있음, **59종 미선정** |
| 4) 방광주혈흡충 | *Schistosoma haematobium* | `drafts/trematode/Schistosoma spp.md` 에 통합 | 59종은 **52 주혈흡충(spp.) 하나로 묶음** — PDF는 종별 분리 |
| 5) 일본 / 만손주혈흡충 | *S. japonicum* / *S. mansoni* | 동상 | 동상 |

→ **신규 작성 1건**(브라질구충/개구충), **선정 승격 후보 2건**(유극악구충·요코가와흡충), **분리 여부 판단 1건**(주혈흡충 3종).
주혈흡충은 기생 부위가 종마다 다르므로(haematobium 방광정맥 / japonicum·mansoni 장간막정맥) `location`·`evasion` 태그가 갈린다. MATCHUP 태그 기반으로 통일하기로 한 이상 **spp. 한 종으로 묶으면 상성이 뭉개진다** — 분리 권장.

### 9-2. 59종에 있으나 PDF에 없는 기생충

| 59종# | 이름 | 사유 |
|---|---|---|
| 44 | 말레이사상충 *Brugia malayi* | PDF 사상충 절에 반크롭트·회선·로아만 수록 |
| 47 | 동양안충 *Thelazia callipaeda* | PDF 미수록 |
| 53 | 스파르가눔 *Spirometra* spp. | PDF에 조충류 절 자체가 없음 |
| 54 | 유구조충 *Taenia solium* | 동상 |

→ 이 4종은 **강의록(43·44·49·50강 조충 총론/무구·유구조충/유구낭미충, 29강 사상충·동양안충)** 을 정본으로 삼는다.

## VOCAB 확장 제안 (제안만 — `VOCAB.md` 무수정)

§8-1 "새 값이 필요하면 이 파일에 먼저 추가한다"에 따라, 위 항목 2·7·8에서 나온 미등재 값의 처리 방향만 분류한다. 실제 개정은 확인 후.

### A. §2-3 evasion 에 흡수 (값 이름만 정규화하면 됨)

| 현 표기 | → VOCAB §2-3 |
|---|---|
| 바이오필름 (11) | `생물막` |
| 세포내생존(10) · 세포내침입(2) · 대식세포생존 · 식포융합차단 · 포식소체성숙차단 | `세포내은신` |
| 항산성막(2) · 산저항성 | `항산성` |
| 무세포벽(3) | `세포벽없음` |
| 과점액협막 · F1협막 · Vi협막 | `협막` |
| 근육낭종 · 낭미충 · 조직낭종 · 폐낭종 | `낭종` |
| 잠복감염 · 신경절잠복 · B세포잠복 · 혈관잠복 · 적혈구잠복 · 림프잠복 · 지속감염 · 저강도지속감염 · 만성화 | `잠복` |
| 스파이크변이 · 형태전환 | `항원변이` |
| 내성(2) · 반코마이신내성 | `내성효소` |

### B. §2-3 신설 후보 (현실 치료 상성이 실제로 갈리는 것)

| 후보 값 | 근거 | MATCHUP 행 |
|---|---|---|
| `보체회피` | `M단백`(S. pyogenes), `면역회피` — 현 코드에 `comp_evade` 로 이미 존재 | 보체/선천면역 반감 |
| `환경저항` | `비외피안정성` · `이중캡시드` · `포자분산` · `환경저항성` — 외피없는 바이러스·진균포자의 소독 저항 | 환경차단 반감 |
| `철획득` | `철획득` · `유레아제` — 숙주 철·요소 이용. 지지요법(철분 보충)과 직접 맞물림 | 지지요법 특효 |

### C. evasion 아님 — 다른 축/블록으로 이관

| 현 `방어특성` 값 | 이관처 |
|---|---|
| 담관정착 · 눈기생 · 간이행 · 간실질이행 · 림프정착 · 신경이행 · 신경축삭이동 · 피하이동 · 조직이행 · 조직침습 | `태그.location` (VOCAB §2-2). 단 유충이 이동하며 정착을 피하는 경우만 `evasion: 유충이행` |
| 부착선모 · 섬모부착 · 장점막부착 · 장점막고정 · 두관극부착 | 회피 구조가 아니라 정착 기전 → **준비기 기술** 또는 `학습포인트` |
| 흡혈 · 편절분리 · 편모운동 · 접촉전파 · 포자분산 | 병인·생활사 → `학습포인트` |
| 저온증식 · 염분선호 · 미세호기성 · 정상균총 · 대형저항 | 상성 판정에 안 걸림 → 폐기 |

### D. §3 상태이상 · §6 처치계열

- **§3 정합:** VOCAB §3 19종 vs 코드 `data/statusConditions.ts` 19종 — 서로 하나씩 다르다. VOCAB에만 `빈혈`, 코드에만 `청력 이상`. 노트에서 실제로 발견된 미등재 상태이상은 `호산구 증가` 1종(파서가 `면역 이상`으로 흡수 중).
  - `빈혈` 은 구충(철결핍성 빈혈)·EHEC(HUS)·말라리아의 핵심 학습 포인트라 **코드 쪽에 추가**가 맞다. `청력 이상` 은 VOCAB §3에 추가하거나 `시력 이상`과 묶어 감각 이상으로 정리.
- **§6 미매핑 3종:** `분변미생물 이식`(FMT) → 신설 후보 또는 `환경차단` 편입 / `세피데로콜` → `세포벽억제`(사이드로포어 세팔로스포린) / `상처 처치` → `물리제거`.

## 부록 — v2 마이그레이션 진척도

| 지표 | 노트 수 | 비고 |
|---|---:|---|
| `설계검토:` 잔존 | 131 | v2에서 제거 (WORKFLOW §2 체크리스트로 이관) |
| `메모:` 잔존 | 131 | v2에서 `학습포인트:`로 대체 |
| `방어특성:` 잔존 | 127 | v2에서 `태그.evasion`으로 흡수 |
| `학습포인트:` 보유 | 0 | v2 필수 |
| `evasion:` 보유 | 0 | v2 필수 |
| `진화:` 보유 | 0 | v2 필수(기생충은 패턴 명시) |
| 대처법 v2 구조(`\| 계열:`) | 0 | v2 필수 |
