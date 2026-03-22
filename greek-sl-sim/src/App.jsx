import { useState, useMemo, useEffect, useRef } from "react";

// ─── League config ───────────────────────────────────────────────────────────
const LEAGUE = {
  teams: [
    { id: "aek",   name: "AEK Athens",        short: "AEK",  color: "#FFD700" },
    { id: "paok",  name: "PAOK",               short: "PAOK", color: "#1a1a1a" },
    { id: "oly",   name: "Olympiacos",          short: "OLY",  color: "#CC0000" },
    { id: "pao",   name: "Panathinaikos",       short: "PAO",  color: "#006633" },
    { id: "lev",   name: "Levadiakos",          short: "LEV",  color: "#228B22" },
    { id: "aris",  name: "Aris",               short: "ARIS", color: "#DAA520" },
    { id: "ofi",   name: "OFI Crete",          short: "OFI",  color: "#191970" },
    { id: "atro",  name: "Atromitos",           short: "ATRO", color: "#003DA5" },
    { id: "volos", name: "Volos NFC",           short: "VOL",  color: "#E30613" },
    { id: "kif",   name: "Kifisia",             short: "KIF",  color: "#2E7D32" },
    { id: "pane",  name: "Panetolikos",         short: "PANE", color: "#B71C1C" },
    { id: "ael",   name: "AEL Larissa",         short: "AEL",  color: "#8B0000" },
    { id: "ast",   name: "Asteras Tripolis",    short: "AST",  color: "#CFB53B" },
    { id: "pans",  name: "Panserraikos",        short: "PANS", color: "#0D47A1" },
  ],
  tiebreakers: ["Points","H2H pts","H2H GD","GD","GF","Wins","Away GF","Away W"],
};

// ─── Data helpers ─────────────────────────────────────────────────────────────
const g = (p, min, t) => ({ player: p, minute: min, team: t });
const m = (md, h, a, hs, as_, goals) => ({
  matchday: md, homeTeamId: h, awayTeamId: a,
  played: hs !== null, homeScore: hs, awayScore: as_,
  goals: goals || [],
});

// ─── Match data ───────────────────────────────────────────────────────────────
const MATCHES = [
m(1,"aris","volos",2,0,[g("Hamza Mendyl",3,"aris"),g("Giannis Kargas",26,"aris")]),
m(1,"oly","ast",2,0,[]),
m(1,"pane","atro",0,2,[g("Miguel Luís",20,"atro"),g("P. Michorl",55,"atro")]),
m(1,"pao","ofi",4,1,[g("Tin Jedvaj",7,"pao"),g("Renato Sanches",15,"pao"),g("Santino Andino",51,"pao"),g("Nicolaos Athanasiou",79,"pao"),g("Anastasios Bakasetas",80,"ofi")]),
m(1,"aek","pans",2,0,[g("Petros Mantalos",23,"aek"),g("Zini",27,"aek")]),
m(1,"paok","ael",1,0,[g("Kiril Despodov",47,"paok")]),
m(1,"lev","kif",3,2,[g("Andrews Tetteh",25,"lev"),g("Hisham Layous",35,"lev"),g("Alen Ozbolt",39,"lev"),g("Enis Çokaj",41,"kif"),g("Alberto Botía",65,"kif")]),
m(2,"volos","oly",0,2,[g("David Martinez",11,"oly"),g("G. Strefezza",85,"oly")]),
m(2,"pans","ofi",0,1,[g("Andrei Ivan",9,"ofi")]),
m(2,"aris","pane",0,2,[g("Unai García Lugea",43,"pane"),g("Konrad Michalak",65,"pane")]),
m(2,"ael","kif",1,1,[g("Diamantis Houhoumis",28,"ael"),g("Christos Giousis",33,"kif")]),
m(2,"aek","ast",1,0,[g("Frantzdy Pierrot",4,"aek")]),
m(2,"pao","lev",1,1,[g("Filip Duricic",1,"pao"),g("Anastasios Bakasetas",49,"lev")]),
m(2,"paok","atro",1,0,[g("Quini",37,"paok")]),
m(3,"oly","pans",5,0,[g("Zidane Banjaqui",35,"oly"),g("Ayoub El Kaabi",48,"oly"),g("Francisco Ortega",66,"oly"),g("Daniel Podence",70,"oly"),g("Vernon de Marco Morlacchi",76,"oly")]),
m(3,"pane","volos",1,2,[g("S. Hamulic",17,"pane"),g("G. Agapakis",28,"volos"),g("Konrad Michalak",30,"volos")]),
m(3,"atro","aris",1,2,[g("Giorgos Tzovaras",18,"atro"),g("Hamza Mendyl",32,"aris"),g("H. Mendyl",56,"aris")]),
m(3,"ast","ael",2,2,[g("Nikolaos Kaltzas",20,"ast"),g("Julián Bartolo",43,"ast"),g("Miki",63,"ael"),g("Federico Macheda",76,"ael")]),
m(3,"kif","pao",3,2,[g("Andrews Tetteh",7,"pao"),g("Jeremy Antonisse",39,"kif"),g("Rubén Pérez",47,"kif"),g("Jorge Pombo",71,"kif"),g("P. Pantelidis",75,"pao")]),
m(3,"lev","aek",0,1,[g("Ioannis Kosti",65,"aek")]),
m(3,"ofi","paok",1,2,[g("B. Rahman",24,"ofi"),g("Zisis Karahalios",32,"paok"),g("Baba Rahman",66,"paok")]),
m(4,"pao","oly",1,1,[g("Gabriel Strefezza",35,"oly"),g("Cyriel Dessers",39,"pao")]),
m(4,"lev","ofi",4,0,[g("Hisham Layous",1,"lev"),g("Thiago Nuss",12,"lev"),g("Ilias Chatzitheodoridis",26,"lev"),g("Nikos Christogeorgos",46,"lev")]),
m(4,"ael","aek",1,1,[g("Jani Atanasov",20,"ael"),g("Facundo Perez",62,"aek")]),
m(4,"paok","pane",0,0,[]),
m(4,"volos","ast",2,1,[g("David Martinez",4,"volos"),g("Lazaros Lamprou",35,"volos"),g("Maximiliano Comba",60,"ast")]),
m(4,"kif","aris",0,1,[g("Uros Racic",76,"aris")]),
m(4,"pans","atro",1,1,[g("Vernon de Marco Morlacchi",22,"pans"),g("V. Roumiantsev",35,"atro")]),
m(5,"oly","lev",3,2,[g("Francisco Ortega",19,"oly"),g("Panagiotis Retsos",43,"oly"),g("Santiago Hezze",50,"oly"),g("Panagiotis Liagas",58,"lev"),g("Chiquinho",60,"lev")]),
m(5,"pane","pao",1,2,[g("Aguirre",18,"pane"),g("Béni NKololo",48,"pao"),g("Tetê",76,"pao")]),
m(5,"atro","ael",1,1,[g("Bojan Kovačević",23,"ael"),g("Ognjen Ozegovic",28,"atro")]),
m(5,"ast","paok",3,3,[g("Federico Macheda",7,"ast"),g("Nikolaos Kaltzas",19,"ast"),g("Kiril Despodov",26,"paok"),g("Taison",28,"paok"),g("Dani Fernández",34,"ast"),g("Fedor Chalov",40,"paok")]),
m(5,"ofi","kif",1,3,[g("Thiago Nuss",9,"ofi"),g("Jorge Pombo",39,"kif"),g("Levan Shengelia",43,"kif"),g("Jeremy Antonisse",47,"kif")]),
m(5,"aek","volos",1,0,[g("James Penrice",44,"aek")]),
m(5,"aris","pans",1,1,[g("Vernon de Marco Morlacchi",25,"aris"),g("Monchu Ramón Rodríguez Jiménez",44,"pans")]),
m(6,"pao","atro",1,0,[g("Adam Čerin",48,"pao")]),
m(6,"paok","oly",2,1,[g("A. El Kaabi",36,"oly"),g("Giulian Biancone",42,"paok"),g("Tomasz Kedziora",42,"paok")]),
m(6,"kif","aek",2,3,[g("Harold Moukoudi",6,"aek"),g("Andrews Tetteh",8,"kif"),g("Andrews Tetteh",14,"kif"),g("P. Pantelidis",29,"aek"),g("Yasser Larouci",33,"aek")]),
m(6,"lev","pane",6,0,[g("Fabricio Pedrozo",14,"lev"),g("Panagiotis Simelidis",31,"lev"),g("Fabricio Pedrozo",39,"lev"),g("Hisham Layous",61,"lev")]),
m(6,"ael","volos",2,5,[g("Jani Atanasov",22,"ael"),g("Facundo Perez",45,"ael"),g("Leandro Garate",51,"volos"),g("Amr Medhat Warda",74,"volos"),g("Maximiliano Comba",75,"volos"),g("N. Fortuna",77,"volos"),g("Jani Atanasov",77,"volos")]),
m(6,"ofi","aris",3,0,[g("Eddie Salcedo",18,"ofi"),g("Ilias Chatzitheodoridis",19,"ofi"),g("Giannis Apostolakis",33,"ofi")]),
m(6,"pans","ast",2,1,[g("V. Roumiantsev",13,"pans"),g("Vernon de Marco Morlacchi",21,"pans"),g("Eder González",54,"ast")]),
m(7,"aek","paok",0,2,[g("Domagoj Vida",44,"paok"),g("A. Zivkovic",49,"paok")]),
m(7,"aris","pao",1,1,[g("D. Calabria",21,"pao"),g("Giorgos Kiriakopoulos",25,"aris")]),
m(7,"volos","pans",2,1,[g("Saïd Hamulic",1,"volos"),g("Zidane Banjaqui",55,"volos"),g("Aleksa Maraš",67,"pans")]),
m(7,"ast","kif",2,2,[g("Yasser Larouci",26,"ast"),g("Pepe Castaño",34,"ast"),g("O. Adefunyibomi",37,"kif"),g("Konstantinos Pomonis",40,"kif")]),
m(7,"pane","ofi",4,2,[g("Apostolos Androutsos",38,"ofi"),g("Diego Esteban",40,"pane"),g("Konrad Michalak",53,"pane"),g("Lazar Kojić",59,"pane"),g("Andreas Bouchalakis",67,"pane"),g("Béni NKololo",68,"ofi")]),
m(7,"atro","lev",2,2,[g("Makana Baku",20,"atro"),g("P. Tsantilas",24,"lev"),g("Dimitris Tsakmakis",30,"lev"),g("P. Tsantilas",52,"atro")]),
m(7,"ael","oly",0,2,[g("Bojan Kovačević",17,"oly"),g("Lorenzo Scipioni",44,"oly")]),
m(8,"oly","aek",2,0,[g("Daniel Podence",24,"oly"),g("Ayoub El Kaabi",33,"oly")]),
m(8,"paok","volos",3,0,[g("Nurio Fortuna",48,"paok"),g("Giorgos Giakoumakis",49,"paok"),g("Soualiho Meïté",59,"paok")]),
m(8,"pao","ast",2,0,[g("Filip Duricic",53,"pao"),g("Pedro Chirivella",58,"pao")]),
m(8,"lev","aris",1,1,[g("Fredrik Jensen",10,"lev"),g("Lindsay Rose",56,"aris")]),
m(8,"ofi","atro",1,3,[g("Eddie Salcedo",15,"ofi"),g("Nikolaos Marinakis",50,"atro"),g("Thiago Nuss",81,"atro")]),
m(8,"pans","ael",0,2,[g("Petros Bagalianis",40,"ael"),g("Paschalis Staikos",44,"ael")]),
m(8,"kif","pane",1,1,[g("Jorge Pombo",19,"kif"),g("Rubén Pérez",28,"pane")]),
m(9,"volos","pao",1,0,[g("Lazaros Lamprou",23,"volos")]),
m(9,"atro","kif",1,2,[g("Lucas Villafáñez",52,"atro"),g("P. Pantelidis",57,"kif"),g("T. J. Eboh",63,"kif")]),
m(9,"oly","aris",2,1,[g("Christos Mouzakitis",40,"oly"),g("Daniel Podence",49,"oly"),g("Mehdi Taremi",60,"aris")]),
m(9,"ael","lev",0,2,[g("Fabricio Pedrozo",25,"lev"),g("Thanasis Papageorgiou",37,"lev")]),
m(9,"pans","paok",0,5,[g("Aristotelis Karasalidis",16,"paok"),g("G. Tayler",74,"paok"),g("L. Ivanusec",81,"paok"),g("Taison",89,"paok")]),
m(9,"aek","pane",1,0,[g("Domagoj Vida",18,"aek")]),
m(9,"ast","ofi",3,0,[g("Julián Chicco",23,"ast"),g("Evgeni Yablonski",34,"ast"),g("Thiago Nuss",38,"ast")]),
m(10,"pao","paok",2,1,[g("Filip Duricic",4,"pao"),g("Miloš Pantović",20,"pao"),g("Tin Jedvaj",31,"paok")]),
m(10,"atro","volos",0,1,[g("C. Soria",34,"volos")]),
m(10,"ofi","aek",0,1,[g("Giannis Apostolakis",40,"aek")]),
m(10,"lev","pans",5,2,[g("Alen Ozbolt",9,"lev"),g("Che Nunnely",13,"lev"),g("E. Brooks",16,"lev"),g("Alen Ozbolt",54,"lev"),g("Benjamin Verbic",59,"lev"),g("Fabricio Pedrozo",72,"pans"),g("Konstantinos Goumas",83,"pans")]),
m(10,"aris","ast",0,0,[]),
m(10,"kif","oly",1,3,[g("Gerson Sousa",13,"oly"),g("Andrews Tetteh",40,"kif"),g("Moisés Ramírez",43,"oly"),g("P. Pantelidis",47,"oly")]),
m(10,"pane","ael",3,0,[g("Béni NKololo",30,"pane"),g("Charalampos Mavrias",67,"pane"),g("Kosta Aleksić",79,"pane")]),
m(11,"aek","aris",1,0,[g("Orbelín Pineda",12,"aek")]),
m(11,"paok","kif",3,0,[g("David Simón",43,"paok"),g("Jeremy Antonisse",47,"paok"),g("Hugo Sousa",62,"paok")]),
m(11,"pans","pao",0,3,[g("Ihor Kalinin",14,"pao"),g("Pedro Chirivella",40,"pao"),g("Tetê",60,"pao")]),
m(11,"oly","atro",3,0,[g("Peter Michorl",36,"oly"),g("Ayoub El Kaabi",37,"oly"),g("Mehdi Taremi",81,"oly")]),
m(11,"ast","pane",1,1,[g("Issiaga Sylla",9,"ast"),g("K. Ketu",32,"pane")]),
m(11,"ael","ofi",1,2,[g("Leandro Garate",12,"ael"),g("Leandro Garate",31,"ofi"),g("Sofian Chakla",39,"ofi")]),
m(11,"volos","lev",1,2,[g("Joca",22,"volos"),g("Giannis Kargas",26,"lev"),g("Benjamin Verbic",44,"lev")]),
m(12,"pao","aek",2,3,[g("Karol Swiderski",28,"pao"),g("Mijat Gacinovic",35,"aek"),g("Davide Calabria",41,"pao"),g("Luka Jovic",50,"aek"),g("Erik Palmer-Brown",54,"aek")]),
m(12,"lev","paok",2,3,[g("Ioannis Kosti",10,"lev"),g("Tomasz Kedziora",45,"paok"),g("Benjamin Verbic",50,"lev"),g("D. Lovren",77,"paok"),g("Dejan Lovren",77,"paok")]),
m(12,"atro","ast",0,1,[g("Quini",19,"ast")]),
m(12,"pane","oly",0,1,[]),
m(12,"aris","ael",2,1,[g("Uros Racic",12,"aris"),g("Epaminondas Pantelakis",13,"aris"),g("Loren Morón",27,"ael")]),
m(12,"kif","pans",3,0,[]),
m(12,"ofi","volos",0,1,[g("Giannis Theodosoulakis",20,"volos")]),
m(13,"aek","atro",4,1,[]),
m(13,"paok","aris",3,1,[g("Luka Ivanusec",1,"paok"),g("Taison",28,"paok"),g("Giorgos Giakoumakis",48,"paok"),g("Magomed Ozdoev",68,"aris")]),
m(13,"ael","pao",2,2,[g("Facundo Perez",37,"ael"),g("Sofian Chakla",40,"ael"),g("Theocharis Iliadis",56,"pao"),g("Anastasios Bakasetas",77,"pao")]),
m(13,"oly","ofi",3,0,[g("Ayoub El Kaabi",33,"oly"),g("Ayoub El Kaabi",40,"oly"),g("Gabriel Strefezza",63,"oly")]),
m(13,"volos","kif",1,1,[g("David Simón",36,"volos"),g("Saïd Hamulic",43,"kif")]),
m(13,"ast","lev",1,1,[g("O. Adefunyibomi",7,"ast"),g("O. Adefunyibomi",63,"lev")]),
m(13,"pans","pane",0,1,[g("Ethan Brooks",61,"pane")]),
m(14,"lev","ael",3,0,[]),
m(14,"ofi","pans",3,0,[g("Krešimir Krizmanić",4,"ofi"),g("Eddie Salcedo",16,"ofi"),g("Taxiarchis Fountas",23,"ofi")]),
m(14,"kif","ast",0,0,[]),
m(14,"pao","volos",2,1,[]),
m(14,"aris","oly",0,0,[]),
m(14,"atro","paok",2,0,[g("Dimitris Stavropoulos",17,"atro"),g("Theocharis Tsiggaras",47,"atro")]),
m(14,"pane","aek",0,5,[g("Orbelín Pineda",32,"aek"),g("Lazaros Rota",34,"aek"),g("R. Ljubicic",62,"aek"),g("D. Kaloskamis",66,"aek"),g("L. Rota",75,"aek")]),
m(15,"aek","ofi",2,1,[]),
m(15,"paok","pao",2,0,[g("Ioannis Konstantelias",39,"paok"),g("Erik Palmer-Brown",47,"paok")]),
m(15,"ael","atro",0,0,[]),
m(15,"oly","kif",1,1,[]),
m(15,"volos","pane",1,0,[g("David Martinez",57,"volos")]),
m(15,"ast","aris",0,1,[]),
m(15,"pans","lev",0,2,[g("Charalampos Georgiadis",37,"lev"),g("F. Tinaglini",39,"lev")]),
m(16,"kif","ael",1,1,[]),
m(16,"atro","oly",0,2,[g("Samuel Moutoussamy",34,"oly"),g("Dimitris Stavropoulos",38,"oly")]),
m(16,"pane","paok",0,3,[]),
m(16,"lev","volos",3,1,[g("Guillermo Balzi",9,"lev"),g("Enis Çokaj",18,"lev"),g("Carles Soria",41,"volos"),g("Fabricio Pedrozo",67,"lev")]),
m(16,"ofi","ast",4,0,[g("Thiago Nuss",27,"ofi"),g("Thiago Nuss",44,"ofi"),g("Apostolos Androutsos",56,"ofi"),g("Thiago Nuss",67,"ofi")]),
m(16,"aris","aek",1,1,[]),
m(16,"pao","pans",3,0,[g("Filip Duricic",4,"pao"),g("Filip Duricic",4,"pao"),g("Anass Zaroury",15,"pao")]),
m(17,"pans","kif",2,1,[]),
m(17,"ael","aris",1,0,[g("Ángelo Nicolás Sagal Tapia",3,"ael")]),
m(17,"paok","ofi",3,0,[g("Dimitris Pelkas",18,"paok"),g("Konstantinos Kostoulas",38,"paok"),g("Taison",40,"paok")]),
m(17,"aek","pao",4,0,[]),
m(17,"pane","lev",1,3,[g("G. Balzi",10,"pane"),g("Charalampos Mavrias",25,"lev"),g("Kosta Aleksić",39,"lev"),g("Béni NKololo",63,"lev")]),
m(17,"volos","atro",0,3,[]),
m(17,"ast","oly",0,3,[g("Dani García",19,"oly"),g("Bruno Onyemaechi",27,"oly"),g("Pepe Castaño",53,"oly")]),
m(18,"ael","pans",1,0,[]),
m(18,"ast","aek",0,1,[g("Miki",20,"aek")]),
m(18,"oly","volos",1,0,[g("Ayoub El Kaabi",26,"oly")]),
m(18,"aris","lev",2,2,[]),
m(18,"ofi","pane",1,0,[g("Levan Shengelia",29,"ofi")]),
m(18,"atro","pao",0,0,[]),
m(18,"kif","paok",1,4,[g("Alexander Jeremejeff",34,"paok"),g("Konstantinos Roukounakis",60,"paok"),g("Alex Petkov",63,"paok"),g("Alexander Jeremejeff",88,"paok")]),
m(19,"aek","oly",1,1,[]),
m(19,"paok","pans",4,1,[g("Alexander Jeremejeff",5,"paok"),g("Kiril Despodov",8,"paok"),g("Dimitris Pelkas",19,"paok"),g("Alessandro Vogliacco",26,"paok")]),
m(19,"pao","kif",3,0,[g("Andrews Tetteh",21,"pao"),g("Hugo Sousa",35,"pao"),g("Alex Petkov",51,"pao")]),
m(19,"lev","ast",3,1,[g("Sebastián Alberto Palacios",20,"lev"),g("Konstantinos Triandafillopulos",35,"lev"),g("Triantafyllos Tsapras",44,"lev"),g("Sebastián Alberto Palacios",47,"ast")]),
m(19,"volos","ael",0,2,[g("Giannis Kargas",36,"ael"),g("Lubomír Tupta",39,"ael")]),
m(19,"atro","ofi",1,2,[g("Eleftherios Choutesiotis",14,"atro"),g("Samuel Moutoussamy",22,"ofi"),g("Giannis Apostolakis",50,"ofi")]),
m(19,"pane","aris",0,1,[g("D. Hoxha",24,"aris")]),
m(20,"oly","pao",0,1,[]),
m(20,"aris","paok",0,0,[]),
m(20,"ofi","lev",3,2,[g("Giannis Theodosoulakis",10,"ofi"),g("Levan Shengelia",27,"ofi"),g("Eddie Salcedo",37,"ofi"),g("Levan Shengelia",76,"lev")]),
m(20,"pans","aek",0,4,[g("Volnei Feltes",27,"aek"),g("James Penrice",52,"aek"),g("Orbelín Pineda",55,"aek"),g("Ihor Kalinin",61,"aek")]),
m(20,"kif","atro",0,1,[g("Luciano Maidana",87,"atro")]),
m(20,"ast","volos",2,0,[g("Julián Bartolo",62,"ast"),g("Robert Ivanov",67,"ast")]),
m(20,"ael","pane",1,4,[g("F. Rosa",23,"ael"),g("Leandro Garate",31,"pane"),g("Epaminondas Pantelakis",38,"pane"),g("Dylan Batubinsika",58,"pane"),g("Christian Manrique",73,"pane")]),
m(21,"lev","oly",0,0,[]),
m(21,"pane","ast",3,1,[g("Alexandru Matan",19,"pane"),g("Yevhenii Kucherenko",40,"pane"),g("Pepe Castaño",44,"pane"),g("Julián Bartolo",50,"ast")]),
m(21,"volos","aris",1,1,[g("Juan Pablo Añor",53,"volos"),g("Martin Hongla",58,"aris")]),
m(21,"paok","aek",0,0,[]),
m(21,"kif","ofi",2,2,[g("T. Nuss",8,"ofi"),g("Jean Amani",19,"kif"),g("T. Johnson Eboh",23,"kif"),g("Giannis Apostolakis",37,"ofi")]),
m(21,"atro","pans",2,2,[g("Steven Zuber",27,"atro"),g("Giorgos Papadopoulos",45,"atro"),g("Andrei Ivan",63,"pans"),g("Andrei Ivan",64,"pans")]),
m(21,"pao","ael",1,1,[]),
m(22,"aek","lev",4,0,[g("Harold Moukoudi",5,"aek"),g("Razvan Marin",14,"aek"),g("Barnabás Varga",41,"aek"),g("Luka Jovic",49,"aek")]),
m(22,"aris","kif",1,1,[g("Benjamín Garré",41,"aris"),g("Anastasios Donis",56,"kif")]),
m(22,"ael","paok",1,1,[]),
m(22,"ofi","pao",0,2,[g("D. Calabria",52,"pao"),g("Javier Hernández Cabrera",69,"pao")]),
m(22,"pans","volos",2,1,[g("Adrián Riera",19,"pans"),g("S. Ben Sallam",55,"pans"),g("Ihor Kalinin",86,"volos")]),
m(22,"ast","atro",1,2,[g("Mattheos Mountes",27,"ast"),g("D. Jubitana",41,"atro"),g("Julián Chicco",63,"atro")]),
m(22,"oly","pane",2,0,[g("Lorenzo Pirola",37,"oly"),g("Yusuf Yazici",89,"oly")]),
m(23,"ofi","ael",3,0,[g("Taxiarchis Fountas",3,"ofi"),g("Taxiarchis Fountas",7,"ofi"),g("Eddie Salcedo",56,"ofi")]),
m(23,"atro","pane",1,0,[]),
m(23,"kif","lev",1,0,[g("Jakub Pokorný",13,"kif")]),
m(23,"pans","oly",1,2,[g("Andrei Ivan",29,"pans"),g("Rodinei",70,"oly"),g("Vernon de Marco Morlacchi",82,"oly")]),
m(23,"volos","aek",2,2,[g("Maximiliano Comba",14,"volos"),g("Maximiliano Comba",19,"volos"),g("R. Marin",46,"aek"),g("Jan Carlos Hurtado Anchico",62,"aek")]),
m(23,"paok","ast",2,0,[g("Dimitrios Chatsidis",7,"paok"),g("Theofanis Tzandaris",64,"paok")]),
m(23,"pao","aris",3,1,[]),
m(24,"aris","atro",0,0,[]),
m(24,"aek","ael",1,0,[g("Harold Moukoudi",5,"aek")]),
m(24,"ast","pans",0,1,[g("Evgeni Yablonski",27,"pans")]),
m(24,"volos","ofi",1,1,[]),
m(24,"lev","pao",1,4,[g("Sebastián Alberto Palacios",25,"lev"),g("S. Kontouris",37,"pao"),g("Anastasios Bakasetas",50,"pao"),g("A. Tetteh",54,"pao"),g("Guillermo Balzi",59,"pao")]),
m(24,"oly","paok",0,0,[]),
m(24,"pane","kif",2,1,[g("Che Nunnely",20,"pane"),g("Farley Rosa",34,"pane"),g("Youssouph Badji",81,"kif")]),
// MD 25 — played March 14-15, 2026
m(25,"ofi","oly",0,3,[g("Ayoub El Kaabi",30,"oly"),g("Ayoub El Kaabi",70,"oly"),g("Christos Mouzakitis",92,"oly")]),
m(25,"pans","aris",0,0,[]),
m(25,"ael","ast",1,1,[g("Julián Bartolo",40,"ast"),g("Ángelo Nicolás Sagal Tapia",55,"ael")]),
m(25,"kif","volos",2,0,[g("Nikos Christopoulos",25,"kif"),g("Jorge Pombo",68,"kif")]),
m(25,"paok","lev",3,0,[g("Taison",7,"paok"),g("Alexander Jeremejeff",47,"paok"),g("Dimitrios Chatsidis",57,"paok")]),
m(25,"atro","aek",2,2,[g("Giorgos Mitoglou",33,"atro"),g("Luka Jovic",63,"aek"),g("Luka Jovic",69,"aek"),g("Samuel Moutoussamy",71,"atro")]),
m(25,"pao","pane",0,0,[]),
// MD 26 — upcoming (March 29 – April 4, 2026)
m(26,"oly","ael",null,null),
m(26,"ast","pao",null,null),
m(26,"pane","pans",null,null),
m(26,"volos","paok",null,null),
m(26,"lev","atro",null,null),
m(26,"aek","kif",null,null),
m(26,"aris","ofi",null,null),
].map((x, i) => ({ ...x, id: i + 1 }));

// ─── Playoff state (stored outside component so it persists across tab switches)
const PLAYOFF_RESULTS = {};

// ─── Post-season generator ────────────────────────────────────────────────────
function generatePostSeason(standings) {
  const phases = [
    { id: "champ",  name: "Championship Playoffs", teams: standings.slice(0,4).map(s=>s.id),  carry: 1.0, label: "1st–4th · carry 100% pts · 6 games (H&A)" },
    { id: "europe", name: "Europe Playoffs",        teams: standings.slice(4,8).map(s=>s.id),  carry: 0.5, rounding: "ceil", label: "5th–8th · carry 50% pts (rounded up) · 6 games" },
    { id: "releg",  name: "Relegation Playouts",    teams: standings.slice(8,14).map(s=>s.id), carry: 1.0, label: "9th–14th · carry 100% pts · 10 games · Bottom 2 relegated" },
  ];
  const fixtures = [];
  let nextId = 2000;
  phases.forEach(phase => {
    const t = phase.teams;
    for (let round = 0; round < 2; round++) {
      for (let i = 0; i < t.length; i++) {
        for (let j = i + 1; j < t.length; j++) {
          const [h, a] = round === 0 ? [t[i], t[j]] : [t[j], t[i]];
          fixtures.push({
            id: nextId++, phase: phase.id, homeTeamId: h, awayTeamId: a,
            played: false, homeScore: null, awayScore: null, goals: [],
            phaseName: phase.name, phaseCarry: phase.carry, phaseRounding: phase.rounding,
          });
        }
      }
    }
  });
  return { phases, fixtures };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const T = (id) => LEAGUE.teams.find((t) => t.id === id);

const ZONE_COLORS = { ch: "#3d8af7", eu: "#00985f", re: "#e03535" };

function calcStandings(ms) {
  const t = {};
  LEAGUE.teams.forEach((tm) => { t[tm.id] = { id: tm.id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }; });
  ms.forEach((mm) => {
    if (!mm.played || mm.homeScore === null) return;
    const h = t[mm.homeTeamId]; const a = t[mm.awayTeamId];
    if (!h || !a) return;
    h.p++; a.p++; h.gf += mm.homeScore; h.ga += mm.awayScore; a.gf += mm.awayScore; a.ga += mm.homeScore;
    if (mm.homeScore > mm.awayScore)      { h.w++; h.pts += 3; a.l++; }
    else if (mm.homeScore < mm.awayScore) { a.w++; a.pts += 3; h.l++; }
    else                                  { h.d++; a.d++; h.pts++; a.pts++; }
  });
  return Object.values(t).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || b.w - a.w);
}

function calcAtMinute(ms, minute) {
  const t = {};
  LEAGUE.teams.forEach((tm) => { t[tm.id] = { id: tm.id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }; });
  ms.forEach((mm) => {
    if (!mm.played) return;
    const h = t[mm.homeTeamId]; const a = t[mm.awayTeamId];
    if (!h || !a) return;
    let hs = 0, as_ = 0;
    if (mm.goals && mm.goals.length > 0) {
      mm.goals.forEach((gg) => { if (gg.minute <= minute) { if (gg.team === mm.homeTeamId) hs++; else if (gg.team === mm.awayTeamId) as_++; } });
    } else { hs = mm.homeScore; as_ = mm.awayScore; }
    h.p++; a.p++; h.gf += hs; h.ga += as_; a.gf += as_; a.ga += hs;
    if (hs > as_)      { h.w++; h.pts += 3; a.l++; }
    else if (hs < as_) { a.w++; a.pts += 3; h.l++; }
    else               { h.d++; a.d++; h.pts++; a.pts++; }
  });
  return Object.values(t).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || b.w - a.w);
}

// ─── Style tokens ─────────────────────────────────────────────────────────────
const S = {
  card: {
    background: "var(--color-background-secondary,#f8f9fa)",
    border: "1px solid var(--color-border-tertiary,#e9ecef)",
    borderRadius: 10,
    overflow: "hidden",
  },
  pill: (active) => ({
    padding: "4px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
    background: active ? "#3d8af7" : "transparent",
    color: active ? "#fff" : "var(--color-text-secondary,#666)",
    border: active ? "none" : "1px solid var(--color-border-tertiary,#ddd)",
    fontWeight: active ? 600 : 400,
  }),
  teamDot: (color, size = 8) => ({
    display: "inline-block", width: size, height: size,
    borderRadius: 3, background: color || "#aaa",
    marginRight: 5, verticalAlign: "middle", flexShrink: 0,
  }),
};

// ─── Dual-handle slider ───────────────────────────────────────────────────────
function DualSlider({ min, max, low, high, onChange, maxSel }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(null);
  const pct = (v) => ((v - min) / (max - min)) * 100;
  useEffect(() => {
    if (!drag) return;
    const mv = (e) => {
      const r = ref.current.getBoundingClientRect();
      const cx = e.clientX ?? (e.touches?.[0]?.clientX);
      let v = Math.round(Math.max(0, Math.min(1, (cx - r.left) / r.width)) * (max - min) + min);
      if (drag === "low") onChange(Math.min(v, high), high);
      else { v = Math.min(v, maxSel ?? max); onChange(low, Math.max(v, low)); }
    };
    const up = () => setDrag(null);
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
  }, [drag, low, high, maxSel]);

  return (
    <div style={{ position: "relative", height: 32, margin: "0 8px", userSelect: "none" }}>
      <div ref={ref} style={{ position: "absolute", top: 14, left: 0, right: 0, height: 4, background: "var(--color-border-tertiary,#e0e0e0)", borderRadius: 2 }} />
      <div style={{ position: "absolute", top: 14, left: pct(low) + "%", width: (pct(high) - pct(low)) + "%", height: 4, background: "#3d8af7", borderRadius: 2 }} />
      {[["low", low], ["high", high]].map(([w, v]) => (
        <div key={w} onPointerDown={(e) => { e.preventDefault(); setDrag(w); }}
          style={{ position: "absolute", top: 8, left: `calc(${pct(v)}% - 8px)`, width: 16, height: 16, borderRadius: "50%", background: "#fff", border: "2px solid #3d8af7", cursor: "grab", zIndex: drag === w ? 10 : 5, touchAction: "none", boxShadow: "0 1px 4px rgba(61,138,247,0.3)" }} />
      ))}
    </div>
  );
}

// ─── Standings table ──────────────────────────────────────────────────────────
function StTable({ standings, zones = true, compact = false, highlightTeam }) {
  const zs = zones ? [{ s: 0, e: 3, c: ZONE_COLORS.ch }, { s: 4, e: 7, c: ZONE_COLORS.eu }, { s: 8, e: 13, c: ZONE_COLORS.re }] : [];
  const gz = (i) => zs.find((z) => i >= z.s && i <= z.e);
  return (
    <div style={{ ...S.card }}>
      <table style={{ width: "100%", fontSize: compact ? 11 : 13, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--color-background-secondary,#f8f9fa)", borderBottom: "1px solid var(--color-border-tertiary,#e9ecef)" }}>
            {["#","Team","P","W","D","L","GF","GA","GD","Pts"].map((h) => (
              <th key={h} style={{ textAlign: h === "Team" ? "left" : "center", padding: compact ? "5px 3px" : "7px 5px", fontWeight: 600, fontSize: 10, color: "var(--color-text-secondary,#888)", letterSpacing: 0.5, width: h === "Team" ? "auto" : h === "#" ? 24 : 30 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standings.map((r, i) => {
            const tt = T(r.id);
            const z = gz(i);
            const bnd = i > 0 && gz(i - 1) !== z;
            const gd = r.gf - r.ga;
            const isHL = highlightTeam && r.id === highlightTeam;
            return (
              <tr key={r.id} style={{
                borderTop: bnd ? `2px solid ${z ? z.c : "var(--color-border-secondary)"}` : "1px solid var(--color-border-tertiary,#f0f0f0)",
                borderLeft: `3px solid ${z ? z.c : "transparent"}`,
                background: isHL ? "rgba(61,138,247,0.06)" : "transparent",
              }}>
                <td style={{ textAlign: "center", padding: "6px 3px", fontSize: 11, color: "var(--color-text-secondary,#999)", fontWeight: isHL ? 700 : 400 }}>{i + 1}</td>
                <td style={{ padding: "6px 4px", fontWeight: isHL ? 700 : 500 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={S.teamDot(tt?.color)} />
                    <span style={{ fontSize: compact ? 11 : 12 }}>{tt ? tt.short : r.id}</span>
                  </div>
                </td>
                {[r.p, r.w, r.d, r.l, r.gf, r.ga].map((v, j) => (
                  <td key={j} style={{ textAlign: "center", padding: "6px 3px", color: "var(--color-text-secondary,#666)", fontSize: compact ? 10 : 11 }}>{v}</td>
                ))}
                <td style={{ textAlign: "center", padding: "6px 3px", fontWeight: 500, fontSize: compact ? 10 : 11, color: gd > 0 ? "#00985f" : gd < 0 ? "#e03535" : "var(--color-text-secondary,#666)" }}>
                  {gd > 0 ? "+" : ""}{gd}
                </td>
                <td style={{ textAlign: "center", padding: "6px 5px", fontWeight: 700, fontSize: compact ? 12 : 14, color: isHL ? "#3d8af7" : "var(--color-text-primary,#222)" }}>{r.pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ZoneLegend() {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "8px 0 4px" }}>
      {[{ c: ZONE_COLORS.ch, l: "Champ. Playoffs (1–4)" }, { c: ZONE_COLORS.eu, l: "Euro Playoffs (5–8)" }, { c: ZONE_COLORS.re, l: "Rel. Playoffs (9–14, bottom 2 relegated)" }].map((z) => (
        <span key={z.l} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--color-text-secondary,#777)" }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: z.c, display: "inline-block" }} />{z.l}
        </span>
      ))}
    </div>
  );
}

// ─── Match card ────────────────────────────────────────────────────────────────
function MatchCard({ match, showGoals = true }) {
  const [open, setOpen] = useState(false);
  const h = T(match.homeTeamId), a = T(match.awayTeamId);
  const hasGoals = match.goals?.length > 0;
  const hWin = match.played && match.homeScore > match.awayScore;
  const aWin = match.played && match.awayScore > match.homeScore;

  return (
    <div style={{ borderBottom: "1px solid var(--color-border-tertiary,#f0f0f0)" }}>
      <div onClick={() => { if (hasGoals && showGoals) setOpen(!open); }}
        style={{ display: "flex", alignItems: "center", padding: "10px 12px", cursor: hasGoals && showGoals ? "pointer" : "default", gap: 4 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
          <span style={{ fontSize: 13, fontWeight: hWin ? 700 : 500, color: hWin ? "var(--color-text-primary,#111)" : "var(--color-text-secondary,#555)" }}>{h?.short ?? match.homeTeamId}</span>
          <span style={S.teamDot(h?.color, 7)} />
        </div>
        <div style={{ minWidth: 56, textAlign: "center" }}>
          {match.played ? (
            <span style={{ fontSize: 15, fontWeight: 700, padding: "3px 8px", background: "var(--color-background-secondary,#f0f0f0)", borderRadius: 6, letterSpacing: 1 }}>
              {match.homeScore} – {match.awayScore}
            </span>
          ) : (
            <span style={{ fontSize: 11, color: "var(--color-text-tertiary,#aaa)", fontWeight: 500 }}>vs</span>
          )}
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 5 }}>
          <span style={S.teamDot(a?.color, 7)} />
          <span style={{ fontSize: 13, fontWeight: aWin ? 700 : 500, color: aWin ? "var(--color-text-primary,#111)" : "var(--color-text-secondary,#555)" }}>{a?.short ?? match.awayTeamId}</span>
        </div>
        {hasGoals && showGoals && (
          <span style={{ fontSize: 9, color: "var(--color-text-tertiary,#bbb)", marginLeft: 4, transform: open ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.15s" }}>▼</span>
        )}
      </div>
      {open && hasGoals && (
        <div style={{ padding: "2px 14px 10px", background: "rgba(0,0,0,0.02)" }}>
          {[...match.goals].sort((a, b) => a.minute - b.minute).map((gg, i) => {
            const isOG = gg.player.includes("(OG)");
            return (
              <div key={i} style={{ display: "flex", justifyContent: gg.team === match.homeTeamId ? "flex-start" : "flex-end", padding: "2px 0" }}>
                <span style={{ fontSize: 11, color: isOG ? "#e03535" : "var(--color-text-secondary,#666)", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, color: "#aaa" }}>{gg.minute}'</span>
                  <span>{gg.player}</span>
                  {isOG && <span style={{ fontSize: 9, color: "#e03535" }}>OG</span>}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Standings ───────────────────────────────────────────────────────────
function StandingsTab() {
  const lp = Math.max(...MATCHES.filter(mm => mm.played).map(mm => mm.matchday));
  const [rL, setRL] = useState(1);
  const [rH, setRH] = useState(lp);
  const fil = useMemo(() => MATCHES.filter(mm => mm.matchday >= rL && mm.matchday <= rH), [rL, rH]);
  const st = useMemo(() => calcStandings(fil), [fil]);

  return (
    <div>
      <div style={{ ...S.card, padding: "10px 14px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary,#777)" }}>Matchday range</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>MD {rL} – MD {rH}</span>
        </div>
        <DualSlider min={1} max={26} low={rL} high={rH} maxSel={lp} onChange={(l, h) => { setRL(l); setRH(Math.min(h, lp)); }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 10, color: "var(--color-text-tertiary,#aaa)" }}>MD 1</span>
          <span style={{ fontSize: 10, color: "var(--color-text-tertiary,#aaa)" }}>MD {lp} (latest)</span>
          <span style={{ fontSize: 10, color: "var(--color-text-tertiary,#aaa)" }}>MD 26</span>
        </div>
      </div>
      <StTable standings={st} />
      <ZoneLegend />
      <p style={{ fontSize: 10, color: "var(--color-text-tertiary,#aaa)", marginTop: 4 }}>
        <strong style={{ fontWeight: 600 }}>Tiebreakers:</strong> {LEAGUE.tiebreakers.join(" → ")}
      </p>
    </div>
  );
}

// ─── Tab: Fixtures ────────────────────────────────────────────────────────────
function FixturesTab() {
  const lp = Math.max(...MATCHES.filter(mm => mm.played).map(mm => mm.matchday));
  const [md, setMd] = useState(lp);
  const mdMatches = MATCHES.filter(mm => mm.matchday === md);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <button onClick={() => setMd(Math.max(1, md - 1))} style={{ padding: "5px 12px", background: "var(--color-background-secondary,#f5f5f5)", border: "1px solid var(--color-border-tertiary,#ddd)", borderRadius: 8, cursor: "pointer", fontSize: 14, color: "var(--color-text-primary,#333)" }}>‹</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Matchday {md}</span>
          <span style={{ marginLeft: 8, fontSize: 11, color: md <= lp ? "#00985f" : "var(--color-text-tertiary,#aaa)", fontWeight: 600 }}>{md <= lp ? "✓ Played" : "Upcoming"}</span>
        </div>
        <button onClick={() => setMd(Math.min(26, md + 1))} style={{ padding: "5px 12px", background: "var(--color-background-secondary,#f5f5f5)", border: "1px solid var(--color-border-tertiary,#ddd)", borderRadius: 8, cursor: "pointer", fontSize: 14, color: "var(--color-text-primary,#333)" }}>›</button>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 3, flexWrap: "wrap", marginBottom: 12 }}>
        {Array.from({ length: 26 }, (_, i) => i + 1).map((d) => (
          <button key={d} onClick={() => setMd(d)} style={{
            width: 26, height: 22, fontSize: 10, fontWeight: md === d ? 700 : 400,
            border: md === d ? "2px solid #3d8af7" : "1px solid var(--color-border-tertiary,#ddd)",
            borderRadius: 5, cursor: "pointer",
            background: md === d ? "#3d8af7" : d <= lp ? "var(--color-background-secondary,#f5f5f5)" : "transparent",
            color: md === d ? "#fff" : d <= lp ? "var(--color-text-primary,#333)" : "var(--color-text-tertiary,#aaa)",
          }}>{d}</button>
        ))}
      </div>
      <div style={{ ...S.card }}>
        {mdMatches.map(mm => <MatchCard key={mm.id} match={mm} />)}
      </div>
      {mdMatches.some(mm => mm.goals?.length > 0) && (
        <p style={{ fontSize: 10, color: "var(--color-text-tertiary,#aaa)", marginTop: 6, textAlign: "center" }}>Tap a match to see goalscorers</p>
      )}
    </div>
  );
}

// ─── Tab: Minutes ─────────────────────────────────────────────────────────────
function MinutesTab() {
  const [minute, setMinute] = useState(90);
  const played = MATCHES.filter(mm => mm.played);
  const st = useMemo(() => calcAtMinute(played, minute), [minute]);
  const ft = useMemo(() => calcStandings(played), []);
  const ftPos = {}; ft.forEach((s, i) => { ftPos[s.id] = i + 1; });
  const withGoals = played.filter(mm => mm.goals?.length > 0).length;
  const changes = useMemo(() => {
    let c = 0;
    played.filter(mm => mm.goals?.length > 0).forEach(mm => {
      let hs = 0, as_ = 0;
      mm.goals.forEach(gg => { if (gg.minute <= minute) { if (gg.team === mm.homeTeamId) hs++; else as_++; } });
      const fr = mm.homeScore > mm.awayScore ? "H" : mm.homeScore < mm.awayScore ? "A" : "D";
      const mr = hs > as_ ? "H" : hs < as_ ? "A" : "D";
      if (fr !== mr) c++;
    });
    return c;
  }, [minute]);

  return (
    <div>
      <div style={{ ...S.card, padding: "12px 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary,#777)" }}>Freeze all matches at</span>
          <span style={{ fontSize: 32, fontWeight: 800, color: "#3d8af7", lineHeight: 1 }}>{minute}'</span>
        </div>
        <input type="range" min={0} max={95} value={minute} onChange={e => setMinute(parseInt(e.target.value))}
          style={{ width: "100%", accentColor: "#3d8af7", cursor: "pointer" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          {["0' KO", "45' HT", "90'+ FT"].map(l => <span key={l} style={{ fontSize: 10, color: "var(--color-text-tertiary,#aaa)" }}>{l}</span>)}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
        {[
          { l: "Frozen at", v: minute + "'", c: "#3d8af7" },
          { l: "Results changed", v: changes, c: changes > 0 ? "#e03535" : "#00985f" },
          { l: "Scorer data", v: `${withGoals}/${played.length}` },
        ].map(c => (
          <div key={c.l} style={{ ...S.card, padding: "10px 10px" }}>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary,#888)", marginBottom: 3 }}>{c.l}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: c.c || "var(--color-text-primary,#222)" }}>{c.v}</div>
          </div>
        ))}
      </div>
      <StTable standings={st} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {st.map((s, i) => {
          const d = ftPos[s.id] - (i + 1);
          if (!d) return null;
          return (
            <span key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: d > 0 ? "#00985f" : "#e03535", background: d > 0 ? "rgba(0,152,95,0.1)" : "rgba(224,53,53,0.1)", padding: "2px 7px", borderRadius: 10 }}>
              <span style={S.teamDot(T(s.id)?.color, 6)} />{T(s.id)?.short} {d > 0 ? "↑" : "↓"}{Math.abs(d)}
            </span>
          );
        })}
      </div>
      <ZoneLegend />
    </div>
  );
}

// ─── Tab: Playoffs ────────────────────────────────────────────────────────────
function PlayoffsTab() {
  const fullSt = useMemo(() => calcStandings(MATCHES.filter(mm => mm.played)), []);
  const { phases, fixtures: baseFixtures } = useMemo(() => generatePostSeason(fullSt), [fullSt]);
  const [results, setResults] = useState(PLAYOFF_RESULTS);
  const phaseColors = { champ: ZONE_COLORS.ch, europe: ZONE_COLORS.eu, releg: ZONE_COLORS.re };

  const setScore = (id, side, val) => {
    const v = val === "" ? null : Math.max(0, Math.min(20, parseInt(val) || 0));
    setResults(prev => {
      const next = { ...prev, [id]: { ...prev[id], [side]: v } };
      Object.assign(PLAYOFF_RESULTS, next);
      return next;
    });
  };

  const fixtures = baseFixtures.map(f => {
    const r = results[f.id];
    if (r && r.h !== null && r.a !== null && r.h !== undefined && r.a !== undefined) {
      return { ...f, played: true, homeScore: r.h, awayScore: r.a };
    }
    return f;
  });

  return (
    <div>
      <div style={{ ...S.card, padding: "10px 14px", marginBottom: 16, borderLeft: "3px solid #3d8af7" }}>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary,#666)", margin: 0, lineHeight: 1.5 }}>
          Post-season starts <strong>April 4, 2026</strong>. Based on final MD 26 standings. Enter scores below as matches are played.
        </p>
      </div>
      {phases.map(phase => {
        const color = phaseColors[phase.id];
        const teamSt = fullSt.filter(s => phase.teams.includes(s.id));
        const phaseFixtures = fixtures.filter(f => f.phase === phase.id);

        const carryPts = teamSt.map(s => ({
          ...s,
          carriedPts: phase.carry === 0.5
            ? (phase.rounding === "ceil" ? Math.ceil(s.pts / 2) : Math.floor(s.pts / 2))
            : s.pts,
        })).sort((a, b) => b.carriedPts - a.carriedPts);

        // Live standings for this phase
        const phaseStandings = (() => {
          const base = {};
          carryPts.forEach(s => { base[s.id] = { id: s.id, pts: s.carriedPts, w: 0, d: 0, l: 0, gf: 0, ga: 0 }; });
          phaseFixtures.filter(f => f.played).forEach(f => {
            const h = base[f.homeTeamId], a = base[f.awayTeamId];
            if (!h || !a) return;
            h.gf += f.homeScore; h.ga += f.awayScore; a.gf += f.awayScore; a.ga += f.homeScore;
            if (f.homeScore > f.awayScore)      { h.w++; h.pts += 3; a.l++; }
            else if (f.homeScore < f.awayScore) { a.w++; a.pts += 3; h.l++; }
            else                                { h.d++; a.d++; h.pts++; a.pts++; }
          });
          return Object.values(base).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || b.w - a.w);
        })();

        return (
          <div key={phase.id} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: color, display: "inline-block" }} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>{phase.name}</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--color-text-secondary,#777)", margin: "0 0 10px" }}>{phase.label}</p>

            {/* Standings with carry pts */}
            <div style={{ ...S.card, marginBottom: 10 }}>
              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--color-background-secondary,#f8f9fa)", borderBottom: "1px solid var(--color-border-tertiary,#eee)" }}>
                    {["#","Team","Reg. Pts","Carry Pts","Pts","GD"].map(h => (
                      <th key={h} style={{ textAlign: h === "Team" ? "left" : "center", padding: "5px 6px", fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary,#888)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {phaseStandings.map((s, i) => {
                    const base = carryPts.find(c => c.id === s.id);
                    const tt = T(s.id);
                    const gd = s.gf - s.ga;
                    return (
                      <tr key={s.id} style={{ borderTop: "1px solid var(--color-border-tertiary,#f0f0f0)", borderLeft: `3px solid ${color}` }}>
                        <td style={{ textAlign: "center", padding: "5px 4px", fontSize: 11, color: "#999" }}>{i + 1}</td>
                        <td style={{ padding: "5px 6px", fontWeight: 500 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={S.teamDot(tt?.color)} />
                            <span>{tt?.short}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: "center", padding: "5px 4px", color: "#999", fontSize: 11 }}>{base?.pts}</td>
                        <td style={{ textAlign: "center", padding: "5px 4px", color: "#666" }}>{base?.carriedPts}</td>
                        <td style={{ textAlign: "center", padding: "5px 4px", fontWeight: 700, color: "#3d8af7" }}>{s.pts}</td>
                        <td style={{ textAlign: "center", padding: "5px 4px", color: gd > 0 ? "#00985f" : gd < 0 ? "#e03535" : "#999", fontSize: 11 }}>{gd > 0 ? "+" : ""}{gd}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Fixtures with score entry */}
            <div style={{ ...S.card }}>
              {phaseFixtures.map((f, fi) => {
                const hT = T(f.homeTeamId), aT = T(f.awayTeamId);
                const r = results[f.id] || { h: "", a: "" };
                const hS = r.h !== null && r.h !== undefined ? r.h : "";
                const aS = r.a !== null && r.a !== undefined ? r.a : "";
                const hWin = f.played && f.homeScore > f.awayScore;
                const aWin = f.played && f.awayScore > f.homeScore;
                return (
                  <div key={f.id} style={{ borderBottom: fi < phaseFixtures.length - 1 ? "1px solid var(--color-border-tertiary,#f0f0f0)" : "none", padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: hWin ? 700 : 500, color: hWin ? "var(--color-text-primary,#111)" : "var(--color-text-secondary,#555)" }}>{hT?.short}</span>
                      <span style={S.teamDot(hT?.color, 7)} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="number" min="0" max="20" value={hS} onChange={e => setScore(f.id, "h", e.target.value)}
                        placeholder="–"
                        style={{ width: 32, height: 26, textAlign: "center", fontSize: 13, fontWeight: 700, border: `1px solid ${hWin ? "#3d8af7" : "var(--color-border-secondary,#ddd)"}`, borderRadius: 6, background: hWin ? "rgba(61,138,247,0.08)" : "var(--color-background-primary,#fff)", color: "var(--color-text-primary,#222)" }} />
                      <span style={{ fontSize: 12, color: "#bbb", fontWeight: 700 }}>–</span>
                      <input type="number" min="0" max="20" value={aS} onChange={e => setScore(f.id, "a", e.target.value)}
                        placeholder="–"
                        style={{ width: 32, height: 26, textAlign: "center", fontSize: 13, fontWeight: 700, border: `1px solid ${aWin ? "#3d8af7" : "var(--color-border-secondary,#ddd)"}`, borderRadius: 6, background: aWin ? "rgba(61,138,247,0.08)" : "var(--color-background-primary,#fff)", color: "var(--color-text-primary,#222)" }} />
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 5 }}>
                      <span style={S.teamDot(aT?.color, 7)} />
                      <span style={{ fontSize: 12, fontWeight: aWin ? 700 : 500, color: aWin ? "var(--color-text-primary,#111)" : "var(--color-text-secondary,#555)" }}>{aT?.short}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Predict ─────────────────────────────────────────────────────────────
function PredictTab({ predictions, setPredictions }) {
  const unp = MATCHES.filter(mm => !mm.played);
  const byMd = {};
  unp.forEach(mm => { (byMd[mm.matchday] = byMd[mm.matchday] || []).push(mm); });

  const proj = useMemo(() => {
    const merged = MATCHES.map(mm => {
      if (mm.played) return mm;
      const p = predictions[mm.id];
      if (p && p.h !== "" && p.h !== null && p.h !== undefined && p.a !== "" && p.a !== null && p.a !== undefined)
        return { ...mm, played: true, homeScore: Number(p.h), awayScore: Number(p.a) };
      return mm;
    });
    return calcStandings(merged);
  }, [predictions]);

  const fullSt = useMemo(() => calcStandings(MATCHES.filter(mm => mm.played)), []);
  const fullPos = {};
  fullSt.forEach((s, i) => { fullPos[s.id] = i + 1; });

  const setScore = (id, side, val) => {
    const v = val === "" ? "" : Math.max(0, Math.min(20, parseInt(val) || 0));
    setPredictions(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [side]: v } }));
  };

  const clearAll = () => setPredictions({});
  const filledCount = unp.filter(mm => {
    const p = predictions[mm.id];
    return p && p.h !== "" && p.h !== null && p.h !== undefined && p.a !== "" && p.a !== null && p.a !== undefined;
  }).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: "var(--color-text-secondary,#666)" }}>
          {filledCount}/{unp.length} predictions entered
        </span>
        {filledCount > 0 && (
          <button onClick={clearAll} style={{ fontSize: 11, color: "#e03535", background: "transparent", border: "1px solid #e03535", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Clear all</button>
        )}
      </div>

      {/* Fixtures to predict */}
      {Object.keys(byMd).sort((a, b) => Number(a) - Number(b)).map(mdKey => (
        <div key={mdKey} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-secondary,#888)", letterSpacing: 0.5, marginBottom: 6, paddingLeft: 2 }}>MATCHDAY {mdKey}</div>
          <div style={{ ...S.card }}>
            {byMd[mdKey].map((match, mi) => {
              const p = predictions[match.id] || { h: "", a: "" };
              const hT = T(match.homeTeamId), aT = T(match.awayTeamId);
              return (
                <div key={match.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderBottom: mi < byMd[mdKey].length - 1 ? "1px solid var(--color-border-tertiary,#f0f0f0)" : "none" }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{hT?.short}</span>
                    <span style={S.teamDot(hT?.color, 7)} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input type="number" min="0" max="20" value={p.h ?? ""} onChange={e => setScore(match.id, "h", e.target.value)}
                      placeholder="–"
                      style={{ width: 34, height: 28, textAlign: "center", fontSize: 14, fontWeight: 700, border: "1px solid var(--color-border-secondary,#ddd)", borderRadius: 6, background: "var(--color-background-primary,#fff)", color: "var(--color-text-primary,#222)" }} />
                    <span style={{ fontSize: 12, color: "#bbb", fontWeight: 700 }}>–</span>
                    <input type="number" min="0" max="20" value={p.a ?? ""} onChange={e => setScore(match.id, "a", e.target.value)}
                      placeholder="–"
                      style={{ width: 34, height: 28, textAlign: "center", fontSize: 14, fontWeight: 700, border: "1px solid var(--color-border-secondary,#ddd)", borderRadius: 6, background: "var(--color-background-primary,#fff)", color: "var(--color-text-primary,#222)" }} />
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 5 }}>
                    <span style={S.teamDot(aT?.color, 7)} />
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{aT?.short}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Projected standings */}
      {filledCount > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary,#888)", letterSpacing: 0.5, marginBottom: 8 }}>PROJECTED STANDINGS</div>
          <div style={{ ...S.card, marginBottom: 8 }}>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--color-background-secondary,#f8f9fa)", borderBottom: "1px solid var(--color-border-tertiary,#eee)" }}>
                  {["#","Team","Pts","GD","Δ"].map(h => (
                    <th key={h} style={{ textAlign: h === "Team" ? "left" : "center", padding: "6px 5px", fontSize: 10, fontWeight: 600, color: "#888" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proj.map((r, i) => {
                  const tt = T(r.id);
                  const gd = r.gf - r.ga;
                  const oldPos = fullPos[r.id];
                  const delta = oldPos - (i + 1);
                  const zoneColors = [ZONE_COLORS.ch,ZONE_COLORS.ch,ZONE_COLORS.ch,ZONE_COLORS.ch,ZONE_COLORS.eu,ZONE_COLORS.eu,ZONE_COLORS.eu,ZONE_COLORS.eu,ZONE_COLORS.re,ZONE_COLORS.re,ZONE_COLORS.re,ZONE_COLORS.re,ZONE_COLORS.re,ZONE_COLORS.re];
                  return (
                    <tr key={r.id} style={{ borderTop: "1px solid var(--color-border-tertiary,#f0f0f0)", borderLeft: `3px solid ${zoneColors[i]}` }}>
                      <td style={{ textAlign: "center", padding: "6px 4px", fontSize: 11, color: "#999" }}>{i + 1}</td>
                      <td style={{ padding: "6px 5px", fontWeight: 500 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={S.teamDot(tt?.color)} />
                          <span style={{ fontSize: 12 }}>{tt?.short}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "center", padding: "6px 4px", fontWeight: 700, fontSize: 13 }}>{r.pts}</td>
                      <td style={{ textAlign: "center", padding: "6px 4px", fontSize: 11, color: gd > 0 ? "#00985f" : gd < 0 ? "#e03535" : "#999" }}>{gd > 0 ? "+" : ""}{gd}</td>
                      <td style={{ textAlign: "center", padding: "6px 4px", fontSize: 11, fontWeight: 600 }}>
                        {delta !== 0 && <span style={{ color: delta > 0 ? "#00985f" : "#e03535" }}>{delta > 0 ? "↑" : "↓"}{Math.abs(delta)}</span>}
                        {delta === 0 && <span style={{ color: "#bbb" }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ZoneLegend />
        </div>
      )}

      {unp.length === 0 && (
        <div style={{ textAlign: "center", padding: 24, color: "var(--color-text-tertiary,#aaa)", fontSize: 13 }}>All matches have been played.</div>
      )}
    </div>
  );
}

// ─── Tab: Scenarios ───────────────────────────────────────────────────────────
function ScenariosTab() {
  const [team, setTeam] = useState("pao");
  const [target, setTarget] = useState(1);
  const st = useMemo(() => calcStandings(MATCHES.filter(mm => mm.played)), []);
  const pos = st.findIndex(s => s.id === team) + 1;
  const pts = st.find(s => s.id === team)?.pts || 0;
  const rem = MATCHES.filter(mm => !mm.played && (mm.homeTeamId === team || mm.awayTeamId === team));
  const maxP = pts + rem.length * 3;
  const tT = st[target - 1];
  const tP = tT?.pts || 0;
  const need = Math.max(0, tP - pts + 1);
  const ord = (n) => ["st","nd","rd"][n-1] || "th";

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary,#888)", display: "block", marginBottom: 5, letterSpacing: 0.4 }}>MY TEAM</label>
          <select value={team} onChange={e => setTeam(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", fontSize: 13, fontWeight: 500, border: "1px solid var(--color-border-secondary,#ddd)", borderRadius: 8, background: "var(--color-background-primary,#fff)", color: "var(--color-text-primary,#222)" }}>
            {LEAGUE.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary,#888)", display: "block", marginBottom: 5, letterSpacing: 0.4 }}>TARGET POSITION</label>
          <select value={target} onChange={e => setTarget(parseInt(e.target.value))}
            style={{ width: "100%", padding: "8px 10px", fontSize: 13, fontWeight: 500, border: "1px solid var(--color-border-secondary,#ddd)", borderRadius: 8, background: "var(--color-background-primary,#fff)", color: "var(--color-text-primary,#222)" }}>
            {Array.from({ length: 14 }, (_, i) => (
              <option key={i+1} value={i+1}>{i+1}{ord(i+1)} place</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
        {[
          { l: "Current", v: `${pos}${ord(pos)}`, c: "#3d8af7" },
          { l: "Points", v: pts },
          { l: "Max pts", v: maxP },
          { l: "Games left", v: rem.length },
        ].map(c => (
          <div key={c.l} style={{ ...S.card, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary,#888)", marginBottom: 3 }}>{c.l}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.c || "var(--color-text-primary,#222)" }}>{c.v}</div>
          </div>
        ))}
      </div>

      <div style={{ ...S.card, padding: 14, marginBottom: 14, borderLeft: `4px solid ${maxP < tP ? "#e03535" : pos <= target ? "#00985f" : "#3d8af7"}` }}>
        {maxP < tP ? (
          <div style={{ color: "#e03535", fontSize: 13, fontWeight: 600 }}>Mathematically impossible to reach {target}{ord(target)} place.</div>
        ) : pos <= target ? (
          <div style={{ color: "#00985f", fontSize: 13, fontWeight: 600 }}>Already at {pos}{ord(pos)} — above the {target}{ord(target)} target.</div>
        ) : (
          <div style={{ fontSize: 13 }}>
            Need <strong style={{ color: "#3d8af7", fontSize: 15 }}>{need} pts</strong> — that's <strong>{Math.ceil(need / 3)} wins</strong> from {rem.length} remaining games to reach {target}{ord(target)}.
          </div>
        )}
      </div>

      {rem.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-secondary,#888)", letterSpacing: 0.5, marginBottom: 8 }}>REMAINING FIXTURES</div>
          <div style={{ ...S.card }}>
            {rem.map(mm => <MatchCard key={mm.id} match={mm} showGoals={false} />)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Monte Carlo engine ───────────────────────────────────────────────────────
function poissonRng(lambda) {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}

function buildStrengthModel(playedMatches) {
  const hgf = {}, hga = {}, agf = {}, aga = {}, hg = {}, ag = {};
  LEAGUE.teams.forEach(t => { hgf[t.id]=0; hga[t.id]=0; agf[t.id]=0; aga[t.id]=0; hg[t.id]=0; ag[t.id]=0; });
  let totH = 0, totA = 0, games = 0;
  playedMatches.forEach(m => {
    if (m.homeScore === null) return;
    hgf[m.homeTeamId] += m.homeScore; hga[m.homeTeamId] += m.awayScore; hg[m.homeTeamId]++;
    agf[m.awayTeamId] += m.awayScore; aga[m.awayTeamId] += m.homeScore; ag[m.awayTeamId]++;
    totH += m.homeScore; totA += m.awayScore; games++;
  });
  const avgH = totH / games, avgA = totA / games;
  const hAtk={}, hDef={}, aAtk={}, aDef={};
  LEAGUE.teams.forEach(t => {
    hAtk[t.id] = hg[t.id] ? (hgf[t.id]/hg[t.id])/avgH : 1;
    hDef[t.id] = hg[t.id] ? (hga[t.id]/hg[t.id])/avgA : 1;
    aAtk[t.id] = ag[t.id] ? (agf[t.id]/ag[t.id])/avgA : 1;
    aDef[t.id] = ag[t.id] ? (aga[t.id]/ag[t.id])/avgH : 1;
  });
  return { avgH, avgA, hAtk, hDef, aAtk, aDef };
}

function simMatch(hId, aId, model) {
  const { avgH, avgA, hAtk, hDef, aAtk, aDef } = model;
  return {
    homeScore: poissonRng(avgH * hAtk[hId] * aDef[aId]),
    awayScore: poissonRng(avgA * aAtk[aId] * hDef[hId]),
  };
}

function runMonteCarlo(N = 10000) {
  const played = MATCHES.filter(m => m.played);
  const unplayed = MATCHES.filter(m => !m.played);
  if (unplayed.length === 0) return null;
  const model = buildStrengthModel(played);
  const zoneCounts = {};
  const posCounts = {};
  const ptsSums = {};
  LEAGUE.teams.forEach(t => { zoneCounts[t.id]={ch:0,eu:0,re:0}; posCounts[t.id]=Array(14).fill(0); ptsSums[t.id]=0; });
  for (let i = 0; i < N; i++) {
    const sim = unplayed.map(m => ({ ...m, played: true, goals: [], ...simMatch(m.homeTeamId, m.awayTeamId, model) }));
    const st = calcStandings([...played, ...sim]);
    st.forEach((s, idx) => {
      posCounts[s.id][idx]++;
      ptsSums[s.id] += s.pts;
      if (idx < 4) zoneCounts[s.id].ch++;
      else if (idx < 8) zoneCounts[s.id].eu++;
      else zoneCounts[s.id].re++;
    });
  }
  return { zoneCounts, posCounts, ptsSums, N, unplayedCount: unplayed.length };
}

// ─── Tab: Simulate ────────────────────────────────────────────────────────────
function SimulateTab() {
  const [sims, setSims] = useState(null);
  const [running, setRunning] = useState(false);
  const [n, setN] = useState(10000);
  const currentSt = useMemo(() => calcStandings(MATCHES.filter(m => m.played)), []);
  const currentPos = {};
  currentSt.forEach((s, i) => { currentPos[s.id] = i + 1; });
  const unplayed = MATCHES.filter(m => !m.played);

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      setSims(runMonteCarlo(n));
      setRunning(false);
    }, 20);
  };

  useEffect(() => { run(); }, []);

  const zoneLabel = (pos) => pos < 4 ? "ch" : pos < 8 ? "eu" : "re";

  return (
    <div>
      <div style={{ ...S.card, padding: "12px 14px", marginBottom: 14, borderLeft: "3px solid #3d8af7" }}>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary,#666)", margin: "0 0 10px", lineHeight: 1.5 }}>
          Simulates the remaining <strong>{unplayed.length} match{unplayed.length !== 1 ? "es" : ""}</strong> using a <strong>Poisson goal model</strong>:
          for each fixture we compute an expected home goals λ<sub>H</sub> = avgHome × homeAttack × awayDef and away λ<sub>A</sub> = avgAway × awayAttack × homeDef,
          where attack/defense indices are derived from each team's real 2025-26 goal ratios relative to the league mean.
          Goals are sampled independently from Poisson(λ). Home advantage is implicitly captured by the historical home/away goal averages.
          Each simulation produces a full final table; probabilities are the fraction of {n.toLocaleString()} runs each team spends in each zone.
        </p>
        <div style={{ ...S.card, padding: "8px 12px", marginBottom: 10, background: "rgba(224,53,53,0.05)", borderLeft: "3px solid #e03535" }}>
          <span style={{ fontSize: 11, color: "var(--color-text-secondary,#666)", lineHeight: 1.4 }}>
            ⚠️ <strong>Note on "Rel. Playoffs" zone:</strong> positions 9–14 enter the <em>Relegation Playouts</em> group — only the <strong>bottom 2</strong> of those 6 teams are actually relegated. A high "Rel. Playoffs %" does <em>not</em> mean actual relegation.
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--color-text-secondary,#777)" }}>Simulations:</span>
            {[1000,5000,10000].map(v => (
              <button key={v} onClick={() => setN(v)} style={{ ...S.pill(n === v), fontSize: 11, padding: "3px 10px" }}>{v.toLocaleString()}</button>
            ))}
          </div>
          <button onClick={run} disabled={running} style={{ padding: "6px 16px", background: running ? "#aaa" : "#3d8af7", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: running ? "default" : "pointer" }}>
            {running ? "Running…" : "Run simulation"}
          </button>
        </div>
      </div>

      {sims === null && !running && (
        <div style={{ textAlign: "center", padding: 24, color: "var(--color-text-tertiary,#aaa)", fontSize: 13 }}>All matches played — no simulation needed.</div>
      )}

      {sims && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-secondary,#888)", letterSpacing: 0.5, marginBottom: 10 }}>
            ZONE PROBABILITIES — {sims.N.toLocaleString()} SIMULATIONS
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
            {[{c:ZONE_COLORS.ch,l:"Champ. Playoffs (1–4)"},{c:ZONE_COLORS.eu,l:"Euro Playoffs (5–8)"},{c:ZONE_COLORS.re,l:"Rel. Playoffs (9–14)"}].map(z=>(
              <span key={z.l} style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,color:"var(--color-text-secondary,#777)"}}>
                <span style={{width:10,height:10,borderRadius:2,background:z.c,display:"inline-block"}}/>
                {z.l}
              </span>
            ))}
          </div>
          <div style={{ ...S.card }}>
            {currentSt.map((s, i) => {
              const { ch, eu, re } = sims.zoneCounts[s.id];
              const chPct = Math.round(ch / sims.N * 100);
              const euPct = Math.round(eu / sims.N * 100);
              const rePct = Math.round(re / sims.N * 100);
              const avgPts = Math.round(sims.ptsSums[s.id] / sims.N);
              const modalPos = sims.posCounts[s.id].indexOf(Math.max(...sims.posCounts[s.id])) + 1;
              const tt = T(s.id);
              const curZone = zoneLabel(i);
              return (
                <div key={s.id} style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-tertiary,#f0f0f0)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "#999", width: 18, textAlign: "right", flexShrink: 0 }}>{i+1}</span>
                    <span style={S.teamDot(tt?.color, 9)} />
                    <span style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>{tt?.name}</span>
                    <span style={{ fontSize: 11, color: "#999" }}>~{avgPts} pts</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary,#666)", background: "var(--color-background-secondary,#f5f5f5)", padding: "1px 7px", borderRadius: 8 }}>
                      Most likely: <strong>#{modalPos}</strong>
                    </span>
                  </div>
                  {/* Stacked probability bar */}
                  <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 1, marginBottom: 5 }}>
                    {chPct > 0 && <div style={{ width: chPct + "%", background: ZONE_COLORS.ch }} />}
                    {euPct > 0 && <div style={{ width: euPct + "%", background: ZONE_COLORS.eu }} />}
                    {rePct > 0 && <div style={{ width: rePct + "%", background: ZONE_COLORS.re }} />}
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    {[
                      { pct: chPct, c: ZONE_COLORS.ch, l: "Champ." },
                      { pct: euPct, c: ZONE_COLORS.eu, l: "Euro" },
                      { pct: rePct, c: ZONE_COLORS.re, l: "Rel. PO" },
                    ].map(z => (
                      <span key={z.l} style={{ fontSize: 11, color: z.pct > 0 ? z.c : "var(--color-text-tertiary,#bbb)", fontWeight: z.pct > 50 ? 700 : 500 }}>
                        {z.l} {z.pct}%
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 10, color: "var(--color-text-tertiary,#aaa)", marginTop: 8, lineHeight: 1.4 }}>
            Calibrated on {MATCHES.filter(m=>m.played).length} played matches. "Rel. Playoffs" = enters the 9th–14th group; only the bottom 2 of that group are actually relegated.
          </p>
        </>
      )}
    </div>
  );
}

// ─── Tab: Top Scorers ─────────────────────────────────────────────────────────
// Canonical name map: abbreviations → full names seen in the data
const NAME_ALIASES = {
  "A. El Kaabi": "Ayoub El Kaabi",
  "G. Strefezza": "Gabriel Strefezza",
  "P. Michorl": "Peter Michorl",
  "B. Rahman": "Baba Rahman",
  "D. Calabria": "Davide Calabria",
  "P. Pantelidis": "Panagiotis Pantelidis", // used for Kif player
  "O. Adefunyibomi": "Olamide Adefunyibomi",
  "P. Tsantilas": "Panagiotis Tsantilas",
  "G. Agapakis": "Giorgos Agapakis",
  "T. J. Eboh": "T. Johnson Eboh",
  "T. Nuss": "Thiago Nuss",
  "G. Tayler": "Giancarlo Tayler",
  "L. Ivanusec": "Luka Ivanusec",
  "D. Lovren": "Dejan Lovren",
  "E. Brooks": "Ethan Brooks",
  "C. Soria": "Carles Soria",
  "H. Mendyl": "Hamza Mendyl",
  "G. Balzi": "Guillermo Balzi",
  "D. Hoxha": "Denis Hoxha",
  "D. Kaloskamis": "Dimitris Kaloskamis",
  "R. Ljubicic": "Robert Ljubicic",
  "L. Rota": "Lazaros Rota",
  "D. Jubitana": "Deni Jubitana",
  "F. Tinaglini": "Franco Tinaglini",
  "R. Marin": "Razvan Marin",
  "S. Hamulic": "Saïd Hamulic",
  "N. Fortuna": "Nurio Fortuna",
  "F. Rosa": "Farley Rosa",
  "A. Tetteh": "Andrews Tetteh",
  "A. Zivkovic": "Andrija Zivkovic",
  "S. Ben Sallam": "Samy Ben Sallam",
  "S. Kontouris": "Spyridon Kontouris",
  "K. Ketu": "Kolade Ketu",
};

function canonicalizeName(name) {
  return NAME_ALIASES[name] || name;
}

function buildScorers() {
  const map = {};
  MATCHES.forEach(match => {
    if (!match.played || !match.goals) return;
    match.goals.forEach(goal => {
      if (goal.player.includes("(OG)")) return; // skip own goals
      const name = canonicalizeName(goal.player);
      const key = name + "|" + goal.team;
      if (!map[key]) map[key] = { name, team: goal.team, goals: 0, matches: new Set() };
      map[key].goals++;
      map[key].matches.add(match.id);
    });
  });
  return Object.values(map)
    .map(s => ({ ...s, matches: s.matches.size }))
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
}

function TopScorersTab() {
  const [filterTeam, setFilterTeam] = useState("all");
  const allScorers = useMemo(() => buildScorers(), []);
  const filtered = filterTeam === "all" ? allScorers : allScorers.filter(s => s.team === filterTeam);
  const topN = filtered.slice(0, 50);
  const maxGoals = topN[0]?.goals || 1;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary,#888)", display: "block", marginBottom: 5, letterSpacing: 0.4 }}>FILTER BY TEAM</label>
        <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)}
          style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid var(--color-border-secondary,#ddd)", borderRadius: 8, background: "var(--color-background-primary,#fff)", color: "var(--color-text-primary,#222)" }}>
          <option value="all">All Teams</option>
          {LEAGUE.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div style={{ ...S.card }}>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--color-background-secondary,#f8f9fa)", borderBottom: "1px solid var(--color-border-tertiary,#eee)" }}>
              {["#","Player","Team","","G"].map((h,i) => (
                <th key={i} style={{ textAlign: h === "Player" || h === "" ? "left" : "center", padding: "7px 6px", fontSize: 10, fontWeight: 600, color: "#888", letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topN.map((s, i) => {
              const tt = T(s.team);
              const bar = Math.round((s.goals / maxGoals) * 100);
              return (
                <tr key={s.name + s.team} style={{ borderTop: "1px solid var(--color-border-tertiary,#f0f0f0)" }}>
                  <td style={{ textAlign: "center", padding: "8px 6px", fontSize: 11, color: i < 3 ? "#3d8af7" : "#999", fontWeight: i < 3 ? 700 : 400, width: 28 }}>{i + 1}</td>
                  <td style={{ padding: "8px 6px", fontWeight: i < 3 ? 700 : 500 }}>{s.name}</td>
                  <td style={{ padding: "8px 4px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={S.teamDot(tt?.color, 8)} />
                      <span style={{ fontSize: 11, color: "var(--color-text-secondary,#666)" }}>{tt?.short}</span>
                    </div>
                  </td>
                  <td style={{ padding: "8px 6px", width: 90 }}>
                    <div style={{ height: 5, borderRadius: 3, background: "var(--color-border-tertiary,#eee)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: bar + "%", background: tt?.color || "#3d8af7", borderRadius: 3 }} />
                    </div>
                  </td>
                  <td style={{ textAlign: "center", padding: "8px 8px", fontWeight: 700, fontSize: 15, color: i < 3 ? "#3d8af7" : "var(--color-text-primary,#222)", width: 32 }}>{s.goals}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 24, color: "var(--color-text-tertiary,#aaa)", fontSize: 13 }}>No scorer data available for this team.</div>
        )}
      </div>
      <p style={{ fontSize: 10, color: "var(--color-text-tertiary,#aaa)", marginTop: 8 }}>
        Based on matches with available goalscorer data. Own goals excluded.
      </p>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("standings");
  const [pred, setPred] = useState({});
  const lp = Math.max(...MATCHES.filter(mm => mm.played).map(mm => mm.matchday));

  const tabs = [
    { id: "standings", label: "Standings" },
    { id: "fixtures",  label: "Fixtures" },
    { id: "minutes",   label: "Minutes" },
    { id: "playoffs",  label: "Playoffs" },
    { id: "scorers",   label: "Scorers" },
    { id: "simulate",  label: "Simulate" },
    { id: "predict",   label: "Predict" },
    { id: "scenarios", label: "Scenarios" },
  ];

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", maxWidth: 800, margin: "0 auto", padding: "0 0 32px" }}>
      {/* Header */}
      <div style={{ background: "var(--color-background-primary,#fff)", borderBottom: "1px solid var(--color-border-tertiary,#e9ecef)", padding: "12px 16px 0", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #003893 60%, #4B8BDC)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(0,56,147,0.3)" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>SL</span>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3, color: "var(--color-text-primary,#111)" }}>Greek Super League</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary,#777)", fontWeight: 500 }}>
              2025–26 · Matchday {lp} of 26 · Playoffs begin Apr 4
            </div>
          </div>
        </div>
        {/* Tab bar */}
        <div style={{ display: "flex", gap: 0, overflowX: "auto", scrollbarWidth: "none" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: "8px 12px", fontSize: 13, cursor: "pointer", background: "transparent", border: "none", borderBottom: tab === t.id ? "2px solid #3d8af7" : "2px solid transparent", fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? "#3d8af7" : "var(--color-text-secondary,#666)", whiteSpace: "nowrap", transition: "color 0.15s" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "14px 12px 0" }}>
        {tab === "standings"  && <StandingsTab />}
        {tab === "fixtures"   && <FixturesTab />}
        {tab === "minutes"    && <MinutesTab />}
        {tab === "playoffs"   && <PlayoffsTab />}
        {tab === "scorers"    && <TopScorersTab />}
        {tab === "simulate"   && <SimulateTab />}
        {tab === "predict"    && <PredictTab predictions={pred} setPredictions={setPred} />}
        {tab === "scenarios"  && <ScenariosTab />}
      </div>
    </div>
  );
}
