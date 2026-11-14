"""Scarica la serie storica dei cambi di riferimento BCE e scrive dati/cambi-bce.json (dal 2019, valute principali).
Uso: python aggiorna_cambi.py <file json di uscita>"""
import csv, io, json, sys, urllib.request, zipfile
URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip"
VALUTE = ["USD", "GBP", "CHF", "JPY", "CAD", "AUD", "HKD", "SEK", "NOK", "DKK", "PLN"]
dati = urllib.request.urlopen(URL, timeout=60).read()
z = zipfile.ZipFile(io.BytesIO(dati))
righe = list(csv.DictReader(io.TextIOWrapper(z.open(z.namelist()[0]), encoding="utf-8")))
righe = sorted((r for r in righe if r["Date"] >= "2019-01-01"), key=lambda r: r["Date"])
out = {"fonte": "Banca centrale europea, cambi di riferimento", "aggiornato": righe[-1]["Date"],
       "date": [r["Date"] for r in righe]}
for v in VALUTE:
    out[v] = [float(r[v]) if (r.get(v) or "N/A").strip() not in ("N/A", "") else None for r in righe]
json.dump(out, open(sys.argv[1], "w"), separators=(",", ":"))
print(out["aggiornato"], len(out["date"]))
