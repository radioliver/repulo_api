import express from "express";

const app = express();
const PORT = 3000;

const GENERACIOK = [3, 4, 4.5, 5];

const adatok = {
   kovetkezoId: 16,
   repulok: [
      { id: 1, nev: "MiG-21", gyarto: "Mikojan-Gurevics",
        orszag: "Szovjetunió", elsoRepules: 1955, maxSebesseg: 2175, generacio: 3 },
      { id: 2, nev: "Mirage III", gyarto: "Dassault",
        orszag: "Franciaország", elsoRepules: 1956, maxSebesseg: 2350, generacio: 3 },
      { id: 3, nev: "F-4 Phantom II", gyarto: "McDonnell Douglas",
        orszag: "Egyesült Államok", elsoRepules: 1958, maxSebesseg: 2370, generacio: 3 },
      { id: 4, nev: "F-15 Eagle", gyarto: "McDonnell Douglas",
        orszag: "Egyesült Államok", elsoRepules: 1972, maxSebesseg: 2655, generacio: 4 },
      { id: 5, nev: "F-16 Fighting Falcon", gyarto: "General Dynamics",
        orszag: "Egyesült Államok", elsoRepules: 1974, maxSebesseg: 2120, generacio: 4 },
      { id: 6, nev: "MiG-29", gyarto: "Mikojan-Gurevics",
        orszag: "Szovjetunió", elsoRepules: 1977, maxSebesseg: 2400, generacio: 4 },
      { id: 7, nev: "Szu-27", gyarto: "Szuhoj",
        orszag: "Szovjetunió", elsoRepules: 1977, maxSebesseg: 2500, generacio: 4 },
      { id: 8, nev: "Mirage 2000", gyarto: "Dassault",
        orszag: "Franciaország", elsoRepules: 1978, maxSebesseg: 2340, generacio: 4 },
      { id: 9, nev: "Rafale", gyarto: "Dassault",
        orszag: "Franciaország", elsoRepules: 1986, maxSebesseg: 1910, generacio: 4.5 },
      { id: 10, nev: "JAS 39 Gripen", gyarto: "Saab",
        orszag: "Svédország", elsoRepules: 1988, maxSebesseg: 2460, generacio: 4.5 },
      { id: 11, nev: "Szu-35", gyarto: "Szuhoj",
        orszag: "Oroszország", elsoRepules: 2008, maxSebesseg: 2400, generacio: 4.5 },
      { id: 12, nev: "F-22 Raptor", gyarto: "Lockheed Martin",
        orszag: "Egyesült Államok", elsoRepules: 1997, maxSebesseg: 2410, generacio: 5 },
      { id: 13, nev: "F-35 Lightning II", gyarto: "Lockheed Martin",
        orszag: "Egyesült Államok", elsoRepules: 2006, maxSebesseg: 1930, generacio: 5 },
      { id: 14, nev: "Szu-57", gyarto: "Szuhoj",
        orszag: "Oroszország", elsoRepules: 2010, maxSebesseg: 2600, generacio: 5 },
      { id: 15, nev: "J-20", gyarto: "Chengdu",
        orszag: "Kína", elsoRepules: 2011, maxSebesseg: 2100, generacio: 5 },
   ],
};

function naplozo(req, res, next) {
    const ido = new Date().toLocaleTimeString("hu-HU");
    console.log(`${ido} ${req.method} ${req.originalUrl}`);
    next();
}

function valaszFejlec(req, res, next) {
    res.set("X-Api", "vadaszrepulok");
    next();
}

function ervenyesGeneracio(req, res, next) {
    if (req.query.generacio === undefined) {
        return next();
    }
    const generacio = Number(req.query.generacio);
    if (!GENERACIOK.includes(generacio)) {
        return res.status(400).json({ hiba: "Érvénytelen generáció" });
    }
    req.generacio = generacio;
    next();
}

function ervenyesId(req, res, next) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ hiba: "Az azonosító pozitív egész szám legyen" });
    }
    req.repuloId = id;
    next();
}

function repuloKeresese(req, res, next) {
    const repulo = adatok.repulok.find((r) => r.id === req.repuloId);
    if (!repulo) {
        return res.status(404).json({ hiba: "Nem található ilyen repülő" });
    }
    req.repulo = repulo;
    next();
}

function apiKulcs(req, res, next) {
    if (req.get("X-Api-Kulcs") !== "utanegeto") {
        return res.status(401).json({ hiba: "Hibás API-kulcs" });
    }
    next();
}

function ervenyesRepulo(req, res, next) {
    const { nev, gyarto, orszag, elsoRepules, maxSebesseg, generacio } = req.body || {};
    if (typeof nev !== "string" || !nev.trim() ||
        typeof gyarto !== "string" || !gyarto.trim() ||
        typeof orszag !== "string" || !orszag.trim() ||
        !Number.isInteger(elsoRepules) ||
        typeof maxSebesseg !== "number" || !Number.isFinite(maxSebesseg) || maxSebesseg <= 0 ||
        !GENERACIOK.includes(generacio)) {
        return res.status(400).json({ hiba: "Hibás vagy hiányos adatok" });
    }
    next();
}

app.use(naplozo);
app.use(valaszFejlec);
app.use(express.json());

app.get("/api/repulok", ervenyesGeneracio, (req, res) => {
    if (req.generacio !== undefined) {
        res.json(adatok.repulok.filter((r) => r.generacio === req.generacio));
    } else {
        res.json(adatok.repulok);
    }
});

app.get("/api/repulok/:id", ervenyesId, repuloKeresese, (req, res) => {
    res.json(req.repulo);
});

app.post("/api/repulok", apiKulcs, ervenyesRepulo, (req, res) => {
    const { nev, gyarto, orszag, elsoRepules, maxSebesseg, generacio } = req.body;
    const uj = { id: adatok.kovetkezoId, nev, gyarto, orszag, elsoRepules, maxSebesseg, generacio };
    adatok.kovetkezoId++;
    adatok.repulok.push(uj);
    res.status(201).json(uj);
});

app.delete("/api/repulok/:id", apiKulcs, ervenyesId, repuloKeresese, (req, res) => {
    adatok.repulok.splice(adatok.repulok.indexOf(req.repulo), 1);
    res.status(204).end();
});

app.use((hiba, req, res, next) => {
    if (hiba.status === 400) {
        return res.status(400).json({ hiba: "Hibás JSON" });
    }
    next(hiba);
});

app.listen(PORT, (hiba) => {
    if (hiba) throw hiba;
    console.log(`A szerver fut: http://localhost:${PORT}`);
});
