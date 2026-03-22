import { useState, useMemo, useEffect, useRef } from "react";
const LEAGUE = {
  teams: [
    { id: "aek", name: "AEK Athens", short: "AEK", color: "#FFD700" },
    { id: "paok", name: "PAOK", short: "PAOK", color: "#1a1a1a" },
    { id: "oly", name: "Olympiacos", short: "OLY", color: "#CC0000" },
    { id: "pao", name: "Panathinaikos", short: "PAO", color: "#006633" },
    { id: "lev", name: "Levadiakos", short: "LEV", color: "#228B22" },
    { id: "aris", name: "Aris", short: "ARIS", color: "#DAA520" },
    { id: "ofi", name: "OFI Crete", short: "OFI", color: "#191970" },
    { id: "atro", name: "Atromitos", short: "ATRO", color: "#003DA5" },
    { id: "volos", name: "Volos NFC", short: "VOL", color: "#E30613" },
    { id: "kif", name: "Kifisia", short: "KIF", color: "#2E7D32" },
    { id: "pane", name: "Panetolikos", short: "PANE", color: "#B71C1C" },
    { id: "ael", name: "AEL Larissa", short: "AEL", color: "#8B0000" },
    { id: "ast", name: "Asteras Tripolis", short: "AST", color: "#CFB53B" },
    { id: "pans", name: "Panserraikos", short: "PANS", color: "#0D47A1" },
  ],
  tiebreakers: ["Points","H2H pts","H2H GD","GD","GF","Wins","Away GF","Away W"],
};
const g = (p, min, t) => ({ player: p, minute: min, team: t });
const m = (md, h, a, hs, as_, goals) => ({ matchday: md, homeTeamId: h, awayTeamId: a, played: hs !== null, homeScore: hs, awayScore: as_, goals: goals || [] });
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
m(25,"ofi","oly",null,null),
m(25,"pans","aris",null,null),
m(25,"ael","ast",null,null),
m(25,"kif","volos",null,null),
m(25,"paok","lev",null,null),
m(25,"atro","aek",null,null),
m(25,"pao","pane",null,null),
m(26,"oly","ael",null,null),
m(26,"ast","pao",null,null),
m(26,"pane","pans",null,null),
m(26,"volos","paok",null,null),
m(26,"lev","atro",null,null),
m(26,"aek","kif",null,null),
m(26,"aris","ofi",null,null),].map((x, i) => ({ ...x, id: i + 1 }));

// Generate playoff/playout fixtures based on current standings
function generatePostSeason(standings) {
  const phases = [
    { id: "champ", name: "Championship Playoffs", teams: standings.slice(0,4).map(s=>s.id), carry: 1.0, label: "Top 4 — keep 100% pts, play each other twice (6 games)" },
    { id: "europe", name: "Europe Playoffs", teams: standings.slice(4,8).map(s=>s.id), carry: 0.5, rounding: "ceil", label: "5th-8th — keep 50% pts (round up), play each other twice (6 games)" },
    { id: "releg", name: "Relegation Playouts", teams: standings.slice(8,14).map(s=>s.id), carry: 1.0, label: "9th-14th — keep 100% pts, play each other twice (10 games). Bottom 2 relegated." },
  ];
  const fixtures = [];
  let nextId = 2000;
  phases.forEach(phase => {
    const t = phase.teams;
    let mdOffset = 27;
    for (let round = 0; round < 2; round++) {
      for (let i = 0; i < t.length; i++) {
        for (let j = i + 1; j < t.length; j++) {
          const [h, a] = round === 0 ? [t[i], t[j]] : [t[j], t[i]];
          fixtures.push({ id: nextId++, matchday: mdOffset, phase: phase.id, homeTeamId: h, awayTeamId: a, played: false, homeScore: null, awayScore: null, goals: [], phaseName: phase.name, phaseCarry: phase.carry, phaseRounding: phase.rounding });
        }
      }
    }
  });
  return { phases, fixtures };
}

const T = (id) => LEAGUE.teams.find((t) => t.id === id);
const ZC = { ch: "#378ADD", eu: "#1D9E75", re: "#E24B4A" };

function calcStandings(ms) {
  const t = {};
  LEAGUE.teams.forEach((tm) => { t[tm.id] = { id: tm.id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }; });
  ms.forEach((mm) => {
    if (!mm.played || mm.homeScore === null) return;
    const h = t[mm.homeTeamId]; const a = t[mm.awayTeamId];
    if (!h || !a) return;
    h.p++; a.p++; h.gf += mm.homeScore; h.ga += mm.awayScore; a.gf += mm.awayScore; a.ga += mm.homeScore;
    if (mm.homeScore > mm.awayScore) { h.w++; h.pts += 3; a.l++; }
    else if (mm.homeScore < mm.awayScore) { a.w++; a.pts += 3; h.l++; }
    else { h.d++; a.d++; h.pts++; a.pts++; }
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
    let hs = 0; let as_ = 0;
    if (mm.goals && mm.goals.length > 0) {
      mm.goals.forEach((gg) => { if (gg.minute <= minute) { if (gg.team === mm.homeTeamId) hs++; else if (gg.team === mm.awayTeamId) as_++; } });
    } else { hs = mm.homeScore; as_ = mm.awayScore; }
    h.p++; a.p++; h.gf += hs; h.ga += as_; a.gf += as_; a.ga += hs;
    if (hs > as_) { h.w++; h.pts += 3; a.l++; }
    else if (hs < as_) { a.w++; a.pts += 3; h.l++; }
    else { h.d++; a.d++; h.pts++; a.pts++; }
  });
  return Object.values(t).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || b.w - a.w);
}

function DualSlider({ min, max, low, high, onChange, maxSel }) {
  const ref = useRef(null); const [drag, setDrag] = useState(null);
  const pct = (v) => ((v - min) / (max - min)) * 100;
  useEffect(() => {
    if (!drag) return;
    const mv = (e) => { const r = ref.current.getBoundingClientRect(); let v = Math.round(Math.max(0, Math.min(1, ((e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX)) - r.left) / r.width)) * (max - min) + min); if (drag === "low") { onChange(Math.min(v, high), high); } else { v = Math.min(v, maxSel || max); onChange(low, Math.max(v, low)); } };
    const up = () => setDrag(null);
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
  }, [drag, low, high, maxSel]);
  return (<div style={{ position: "relative", height: 30, margin: "0 8px", userSelect: "none" }}><div ref={ref} style={{ position: "absolute", top: 13, left: 0, right: 0, height: 4, background: "var(--color-border-tertiary)", borderRadius: 2 }} />{maxSel < max ? <div style={{ position: "absolute", top: 13, left: pct(maxSel) + "%", right: 0, height: 4, opacity: 0.4, backgroundImage: "repeating-linear-gradient(90deg,transparent,transparent 3px,var(--color-background-primary) 3px,var(--color-background-primary) 6px)" }} /> : null}<div style={{ position: "absolute", top: 13, left: pct(low) + "%", width: (pct(high) - pct(low)) + "%", height: 4, background: "#378ADD", borderRadius: 2, opacity: 0.6 }} />{[["low", low], ["high", high]].map(([w, v]) => (<div key={w} onPointerDown={(e) => { e.preventDefault(); setDrag(w); }} style={{ position: "absolute", top: 7, left: "calc(" + pct(v) + "% - 7px)", width: 14, height: 14, borderRadius: "50%", background: "var(--color-background-primary)", border: "2px solid #378ADD", cursor: "grab", zIndex: drag === w ? 10 : 5, touchAction: "none" }} />))}</div>);
}

function StTable({ standings, zones, compact }) {
  const zs = zones !== false ? [{ s: 0, e: 3, c: ZC.ch }, { s: 4, e: 7, c: ZC.eu }, { s: 8, e: 13, c: ZC.re }] : [];
  const gz = (i) => zs.find((z) => i >= z.s && i <= z.e);
  return (<div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden" }}><table style={{ width: "100%", fontSize: compact ? 11 : 13, borderCollapse: "collapse" }}><thead><tr style={{ background: "var(--color-background-secondary)" }}>{["#","Team","P","W","D","L","GF","GA","GD","Pts"].map((h) => (<th key={h} style={{ textAlign: h === "Team" ? "left" : "center", padding: compact ? "4px 2px" : "6px 4px", fontWeight: 500, fontSize: 10, color: "var(--color-text-secondary)", width: h === "Team" ? "auto" : h === "#" ? 24 : 28 }}>{h}</th>))}</tr></thead><tbody>{standings.map((r, i) => { const tt = T(r.id); const z = gz(i); const bnd = i > 0 && gz(i - 1) !== z; const gd = r.gf - r.ga; return (<tr key={r.id} style={{ borderTop: bnd ? "2px solid " + (z ? z.c : "var(--color-border-secondary)") : "0.5px solid var(--color-border-tertiary)", borderLeft: z ? "3px solid " + z.c : "3px solid transparent" }}><td style={{ textAlign: "center", padding: "5px 2px", fontSize: 11, color: "var(--color-text-secondary)" }}>{i + 1}</td><td style={{ padding: "5px 3px", fontWeight: 500 }}><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 2, background: tt ? tt.color : "#999", marginRight: 4, verticalAlign: "middle" }} />{tt ? tt.short : r.id}</td>{[r.p, r.w, r.d, r.l, r.gf, r.ga].map((v, j) => (<td key={j} style={{ textAlign: "center", padding: "5px 2px", color: "var(--color-text-secondary)", fontSize: compact ? 10 : 11 }}>{v}</td>))}<td style={{ textAlign: "center", padding: "5px 2px", color: gd > 0 ? "var(--color-text-success)" : gd < 0 ? "var(--color-text-danger)" : "var(--color-text-secondary)", fontSize: compact ? 10 : 11 }}>{gd > 0 ? "+" : ""}{gd}</td><td style={{ textAlign: "center", padding: "5px 3px", fontWeight: 500, fontSize: compact ? 12 : 14 }}>{r.pts}</td></tr>); })}</tbody></table></div>);
}

function Legend() { return (<div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "6px 0" }}>{[{ c: ZC.ch, l: "Championship (100%)" }, { c: ZC.eu, l: "Europe (50% ↑)" }, { c: ZC.re, l: "Relegation (100%)" }].map((z) => (<span key={z.l} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--color-text-secondary)" }}><span style={{ width: 8, height: 8, borderRadius: 2, background: z.c }} />{z.l}</span>))}</div>); }

function MatchRow({ match }) {
  const [open, setOpen] = useState(false);
  const h = T(match.homeTeamId); const a = T(match.awayTeamId);
  const hasG = match.goals && match.goals.length > 0;
  return (<div style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}><div onClick={() => { if (hasG) setOpen(!open); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", cursor: hasG ? "pointer" : "default" }}><span style={{ flex: 1, textAlign: "right", fontWeight: match.played && match.homeScore > match.awayScore ? 500 : 400, fontSize: 13 }}>{h ? h.short : ""}</span><div style={{ minWidth: 46, textAlign: "center" }}>{match.played ? (<span style={{ fontSize: 13, fontWeight: 500, padding: "1px 7px", background: "var(--color-background-secondary)", borderRadius: 4 }}>{match.homeScore} - {match.awayScore}</span>) : (<span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>vs</span>)}</div><span style={{ flex: 1, fontWeight: match.played && match.awayScore > match.homeScore ? 500 : 400, fontSize: 13 }}>{a ? a.short : ""}</span>{hasG ? <span style={{ fontSize: 8, color: "var(--color-text-tertiary)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▼</span> : null}</div>{open && hasG ? (<div style={{ padding: "0 10px 6px", fontSize: 11, color: "var(--color-text-secondary)" }}>{[...match.goals].sort((aa, bb) => aa.minute - bb.minute).map((gg, i) => (<div key={i} style={{ padding: "1px 0", display: "flex", justifyContent: gg.team === match.homeTeamId ? "flex-start" : "flex-end" }}><span style={{ background: "var(--color-background-secondary)", padding: "0 5px", borderRadius: 3 }}>{gg.player} {gg.minute}'</span></div>))}</div>) : null}</div>);
}

function FixturesTab() {
  const lp = Math.max(...MATCHES.filter((mm) => mm.played).map((mm) => mm.matchday));
  const [md, setMd] = useState(lp);
  return (<div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><button onClick={() => setMd(Math.max(1, md - 1))} style={{ padding: "3px 9px", background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: 6, cursor: "pointer", color: "var(--color-text-primary)" }}>←</button><span style={{ fontWeight: 500, fontSize: 14, flex: 1, textAlign: "center" }}>Matchday {md} <span style={{ fontSize: 11, marginLeft: 6, color: md <= lp ? "var(--color-text-success)" : "var(--color-text-tertiary)" }}>{md <= lp ? "✓" : "upcoming"}</span></span><button onClick={() => setMd(Math.min(26, md + 1))} style={{ padding: "3px 9px", background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: 6, cursor: "pointer", color: "var(--color-text-primary)" }}>→</button></div><div style={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap", marginBottom: 10 }}>{Array.from({ length: 26 }, (_, i) => i + 1).map((d) => (<button key={d} onClick={() => setMd(d)} style={{ width: 24, height: 20, fontSize: 9, fontWeight: md === d ? 500 : 400, border: md === d ? "1.5px solid #378ADD" : "0.5px solid var(--color-border-tertiary)", borderRadius: 3, cursor: "pointer", background: md === d ? "#EAF3FE" : d <= lp ? "var(--color-background-secondary)" : "transparent", color: md === d ? "#185FA5" : "var(--color-text-secondary)" }}>{d}</button>))}</div><p style={{ fontSize: 10, color: "var(--color-text-tertiary)", margin: "0 0 6px", textAlign: "center" }}>Tap match to see scorers</p><div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden" }}>{MATCHES.filter((mm) => mm.matchday === md).map((mm) => (<MatchRow key={mm.id} match={mm} />))}</div></div>);
}

function MinutesTab() {
  const [minute, setMinute] = useState(90);
  const played = MATCHES.filter((mm) => mm.played);
  const st = useMemo(() => calcAtMinute(played, minute), [minute]);
  const ft = useMemo(() => calcStandings(played), []);
  const ftPos = {}; ft.forEach((s, i) => { ftPos[s.id] = i + 1; });
  const wGoals = played.filter((mm) => mm.goals && mm.goals.length > 0).length;
  const changes = useMemo(() => { let c = 0; played.filter((mm) => mm.goals && mm.goals.length > 0).forEach((mm) => { let hs = 0; let as_ = 0; mm.goals.forEach((gg) => { if (gg.minute <= minute) { if (gg.team === mm.homeTeamId) hs++; else as_++; } }); const fr = mm.homeScore > mm.awayScore ? "H" : mm.homeScore < mm.awayScore ? "A" : "D"; const mr = hs > as_ ? "H" : hs < as_ ? "A" : "D"; if (fr !== mr) c++; }); return c; }, [minute]);
  return (<div><p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 10px" }}>Freeze all matches at a specific minute. Matches without scorer data use full-time result.</p><div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Freeze at minute</span><span style={{ fontSize: 24, fontWeight: 500, fontFamily: "var(--font-mono)" }}>{minute}'</span></div><input type="range" min={0} max={95} value={minute} onChange={(e) => setMinute(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#378ADD" }} /><div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}><span style={{ fontSize: 9, color: "var(--color-text-tertiary)" }}>0' KO</span><span style={{ fontSize: 9, color: "var(--color-text-tertiary)" }}>45' HT</span><span style={{ fontSize: 9, color: "var(--color-text-tertiary)" }}>90'+ FT</span></div></div><div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>{[{ l: "Minute", v: minute + "'" }, { l: "Results changed", v: changes, c: changes > 0 ? "var(--color-text-danger)" : undefined }, { l: "Scorer data", v: wGoals + "/" + played.length }].map((c) => (<div key={c.l} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "7px 9px" }}><div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{c.l}</div><div style={{ fontSize: 18, fontWeight: 500, color: c.c }}>{c.v}</div></div>))}</div><StTable standings={st} /><div style={{ marginTop: 8, lineHeight: 1.8 }}>{st.map((s, i) => { const d = ftPos[s.id] - (i + 1); if (!d) return null; return (<span key={s.id} style={{ display: "inline-block", fontSize: 11, color: d > 0 ? "var(--color-text-success)" : "var(--color-text-danger)", marginRight: 8 }}>{(T(s.id) || {}).short || s.id} {d > 0 ? "↑" + d : "↓" + Math.abs(d)}</span>); })}</div><Legend /></div>);
}

function PlayoffsTab() {
  const fullSt = useMemo(() => calcStandings(MATCHES.filter(mm => mm.played)), []);
  const postSeason = useMemo(() => generatePostSeason(fullSt), [fullSt]);
  const phaseColors = { champ: ZC.ch, europe: ZC.eu, releg: ZC.re };
  return (<div><p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 12px" }}>Based on current standings after MD24. Fixtures generated automatically — will update as regular season finishes.</p>
    {postSeason.phases.map(phase => {
      const color = phaseColors[phase.id];
      const teamSt = fullSt.filter(s => phase.teams.includes(s.id));
      const carryPts = teamSt.map(s => {
        const carried = phase.carry === 0.5 ? (phase.rounding === "ceil" ? Math.ceil(s.pts / 2) : Math.floor(s.pts / 2)) : s.pts;
        return { ...s, carriedPts: carried };
      }).sort((a, b) => b.carriedPts - a.carriedPts);
      const fixtures = postSeason.fixtures.filter(f => f.phase === phase.id);
      return (<div key={phase.id} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
          <span style={{ fontWeight: 500, fontSize: 14 }}>{phase.name}</span>
        </div>
        <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 8px" }}>{phase.label}</p>
        <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "var(--color-background-secondary)" }}><th style={{ textAlign: "left", padding: "5px 8px", fontSize: 10, color: "var(--color-text-secondary)" }}>Team</th><th style={{ textAlign: "center", padding: "5px 4px", fontSize: 10, color: "var(--color-text-secondary)" }}>Reg. Pts</th><th style={{ textAlign: "center", padding: "5px 4px", fontSize: 10, color: "var(--color-text-secondary)" }}>Carry Pts</th></tr></thead>
            <tbody>{carryPts.map((s, i) => (<tr key={s.id} style={{ borderTop: "0.5px solid var(--color-border-tertiary)", borderLeft: "3px solid " + color }}><td style={{ padding: "5px 8px", fontWeight: 500 }}><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 2, background: (T(s.id) || {}).color, marginRight: 4, verticalAlign: "middle" }} />{(T(s.id) || {}).short}</td><td style={{ textAlign: "center", padding: "5px 4px" }}>{s.pts}</td><td style={{ textAlign: "center", padding: "5px 4px", fontWeight: 500 }}>{s.carriedPts}</td></tr>))}</tbody>
          </table>
        </div>
        <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden" }}>
          {fixtures.map(f => (<MatchRow key={f.id} match={f} />))}
        </div>
      </div>);
    })}
  </div>);
}

function PredictTab({ predictions, setPredictions }) {
  const unp = MATCHES.filter((mm) => !mm.played);
  const byMd = {}; unp.forEach((mm) => { if (!byMd[mm.matchday]) byMd[mm.matchday] = []; byMd[mm.matchday].push(mm); });
  const proj = useMemo(() => { const merged = MATCHES.map((mm) => { if (mm.played) return mm; const p = predictions[mm.id]; if (p && p.h !== "" && p.a !== "") return { ...mm, played: true, homeScore: parseInt(p.h) || 0, awayScore: parseInt(p.a) || 0 }; return mm; }); return calcStandings(merged); }, [predictions]);
  const ss = (id, side, val) => { const v = val === "" ? "" : Math.max(0, Math.min(20, parseInt(val) || 0)); setPredictions((prev) => ({ ...prev, [id]: { ...prev[id], [side]: v } })); };
  return (<div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12 }}><div><p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 6px" }}>Enter scores</p><div style={{ maxHeight: 460, overflowY: "auto", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12 }}>{Object.keys(byMd).sort((a, b) => Number(a) - Number(b)).map((mdKey) => (<div key={mdKey}><div style={{ padding: "4px 8px", background: "var(--color-background-secondary)", fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>MD {mdKey}</div>{byMd[mdKey].map((match) => { const p = predictions[match.id] || { h: "", a: "" }; return (<div key={match.id} style={{ display: "flex", alignItems: "center", gap: 3, padding: "4px 8px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}><span style={{ flex: 1, textAlign: "right", fontSize: 11 }}>{(T(match.homeTeamId) || {}).short}</span><input type="number" min="0" max="20" value={p.h} onChange={(e) => ss(match.id, "h", e.target.value)} style={{ width: 26, height: 20, textAlign: "center", fontSize: 12, fontWeight: 500, border: "0.5px solid var(--color-border-secondary)", borderRadius: 3, background: "var(--color-background-primary)", color: "var(--color-text-primary)" }} /><span style={{ fontSize: 8, color: "var(--color-text-tertiary)" }}>-</span><input type="number" min="0" max="20" value={p.a} onChange={(e) => ss(match.id, "a", e.target.value)} style={{ width: 26, height: 20, textAlign: "center", fontSize: 12, fontWeight: 500, border: "0.5px solid var(--color-border-secondary)", borderRadius: 3, background: "var(--color-background-primary)", color: "var(--color-text-primary)" }} /><span style={{ flex: 1, fontSize: 11 }}>{(T(match.awayTeamId) || {}).short}</span></div>); })}</div>))}</div></div><div><p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 6px" }}>Projected</p><StTable standings={proj} compact /><Legend /></div></div>);
}

function ScenariosTab() {
  const [team, setTeam] = useState("pao"); const [target, setTarget] = useState(1);
  const st = useMemo(() => calcStandings(MATCHES.filter((mm) => mm.played)), []);
  const pos = st.findIndex((s) => s.id === team) + 1;
  const pts = (st.find((s) => s.id === team) || {}).pts || 0;
  const rem = MATCHES.filter((mm) => !mm.played && (mm.homeTeamId === team || mm.awayTeamId === team));
  const maxP = pts + rem.length * 3; const tT = st[target - 1]; const tP = tT ? tT.pts : 0;
  const need = Math.max(0, tP - pts + 1);
  return (<div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}><div><label style={{ fontSize: 11, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>My team</label><select value={team} onChange={(e) => setTeam(e.target.value)} style={{ width: "100%", padding: "6px", fontSize: 13, border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, background: "var(--color-background-primary)", color: "var(--color-text-primary)" }}>{LEAGUE.teams.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}</select></div><div><label style={{ fontSize: 11, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>Target</label><select value={target} onChange={(e) => setTarget(parseInt(e.target.value))} style={{ width: "100%", padding: "6px", fontSize: 13, border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, background: "var(--color-background-primary)", color: "var(--color-text-primary)" }}>{Array.from({ length: 14 }, (_, i) => (<option key={i + 1} value={i + 1}>{i + 1}{["st","nd","rd"][i] || "th"}</option>))}</select></div></div><div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 12 }}>{[{ l: "Position", v: pos + (["st","nd","rd"][pos-1] || "th") }, { l: "Points", v: pts }, { l: "Max", v: maxP }, { l: "Left", v: rem.length }].map((c) => (<div key={c.l} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "6px 8px" }}><div style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>{c.l}</div><div style={{ fontSize: 16, fontWeight: 500 }}>{c.v}</div></div>))}</div><div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: 10, marginBottom: 10 }}>{maxP < tP ? (<div style={{ color: "var(--color-text-danger)", fontSize: 12 }}>Mathematically impossible</div>) : pos <= target ? (<div style={{ color: "var(--color-text-success)", fontSize: 12 }}>Already in position</div>) : (<div style={{ fontSize: 12 }}>Need <strong>{need} pts</strong> ({Math.ceil(need / 3)} wins) from {rem.length} games</div>)}</div><div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden" }}>{rem.map((mm) => (<MatchRow key={mm.id} match={mm} />))}{rem.length === 0 ? <div style={{ padding: 12, textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 12 }}>No games left</div> : null}</div></div>);
}

export default function App() {
  const [tab, setTab] = useState("standings");
  const [rL, setRL] = useState(1); const [rH, setRH] = useState(24);
  const [pred, setPred] = useState({});
  const lp = Math.max(...MATCHES.filter((mm) => mm.played).map((mm) => mm.matchday));
  const fil = useMemo(() => MATCHES.filter((mm) => mm.matchday >= rL && mm.matchday <= rH), [rL, rH]);
  const st = useMemo(() => calcStandings(fil), [fil]);
  const tabs = [{ id: "standings", label: "Standings" },{ id: "fixtures", label: "Fixtures" },{ id: "minutes", label: "Minutes ⏱" },{ id: "playoffs", label: "Playoffs" },{ id: "predict", label: "Predict" },{ id: "scenarios", label: "Scenarios" }];
  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: 800, margin: "0 auto", padding: "0.5rem 0" }}>
      <div style={{ marginBottom: 12 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #003893, #FFF)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--color-border-tertiary)" }}><span style={{ fontSize: 9, fontWeight: 500, color: "#003893" }}>SL</span></div><div><div style={{ fontSize: 16, fontWeight: 500 }}>Greek Super League predictor</div><div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>2025-26 · MD {lp}/26 · 371 real goals · soccer365.net</div></div></div></div>
      <div style={{ display: "flex", gap: 0, borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: 10, overflowX: "auto" }}>{tabs.map((t) => (<button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "5px 10px", fontSize: 12, cursor: "pointer", background: "transparent", border: "none", borderBottom: tab === t.id ? "2px solid #378ADD" : "2px solid transparent", fontWeight: tab === t.id ? 500 : 400, color: tab === t.id ? "#185FA5" : "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{t.label}</button>))}</div>
      {tab === "standings" && (<div><div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}><span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Fixture range</span><span style={{ fontSize: 12, fontWeight: 500 }}>MD {rL} — MD {rH}</span></div><DualSlider min={1} max={26} low={rL} high={rH} maxSel={lp} onChange={(l, h) => { setRL(l); setRH(Math.min(h, lp)); }} /></div><StTable standings={st} /><Legend /><p style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 6 }}><strong style={{ fontWeight: 500 }}>Tiebreakers:</strong> {LEAGUE.tiebreakers.join(" → ")}</p></div>)}
      {tab === "fixtures" && <FixturesTab />}
      {tab === "minutes" && <MinutesTab />}
      {tab === "playoffs" && <PlayoffsTab />}
      {tab === "predict" && <PredictTab predictions={pred} setPredictions={setPred} />}
      {tab === "scenarios" && <ScenariosTab />}
      <div style={{ marginTop: 14, paddingTop: 6, borderTop: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: "var(--color-text-tertiary)", textAlign: "center" }}>371 real goals from soccer365.net · 24 matches pending re-scrape · Re-run scraper to fill</div>
    </div>
  );
}
