const JSZip = require("jszip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/med", (req, res, next) => {
  let content = fs.readFileSync(
    path.resolve(__dirname, "matrice_mise_en_demeure.docx"),
    "binary"
  );
  const zip = new JSZip(content);
  const doc = new Docxtemplater();
  doc.loadZip(zip);

  //set today's date
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; // january is 0...
  let yyyy = today.getFullYear();

  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }

  today = dd + "/" + mm + "/" + yyyy; // date for the word document
  today_file = dd + "-" + mm + "-" + yyyy; // date for the file name

  //set the templateVariables
  doc.setData({
    denomination_sociale_debiteur: req.body.denomination_sociale_debiteur,
    forme_juridique_debiteur: req.body.forme_juridique_debiteur,
    madame: req.body.madame,
    monsieur: req.body.monsieur,
    prenom_representant_legal: req.body.prenom_representant_legal,
    nom_representant_legal: req.body.nom_representant_legal,
    fonction_representant_legal: req.body.fonction_representant_legal,
    adresse_debiteur: req.body.adresse_debiteur,
    code_postal_debiteur: req.body.code_postal_creancier,
    ville_debiteur: req.body.ville_debiteur,
    date_mise_en_demeure: today,
    num_AR: req.body.num_AR,
    denomination_sociale_creancier: req.body.denomination_sociale_creancier,
    nationalite_creancier: req.body.nationalite_creancier,
    forme_juridique_creancier: req.body.forme_juridique_creancier,
    adresse_creancier: req.body.adresse_creancier,
    code_postal_creancier: req.body.code_postal_creancier,
    ville_creancier: req.body.ville_creancier,
    pays_creancier: req.body.pays_creancier,
    produits_vendus: req.body.produits_vendus,
    services_fournis: req.body.services_fournis,
    ht: req.body.ht,
    ttc: req.body.ttc,
    numero_facture: req.body.numero_facture,
    date_facture: req.body.date_facture,
    montant_facture: req.body.montant_facture,
    echeance_facture: req.body.echeance_facture,
    calcul_acomptes_payes: req.body.calcul_acomptes_payes,
    calcul_solde_du: req.body.calcul_solde_du,
    numero_avoir: req.body.numero_avoir,
    date_avoir: req.body.date_avoir,
    montant_avoir: req.body.montant_avoir,
    calcul_creance_principale_HT: req.body.calcul_creance_principale_HT,
    calcul_creance_principale_TTC: req.body.calcul_creance_principale_TTC,
    delai_paiement_facture: req.body.delai_paiement_facture, //"Les factures devaient être payées à {delai_paiement_facture}"
    paiement_a_la_livraison: req.body.paiement_a_la_livraison,
    //  "{denomination_sociale_debiteur} devait payer l’intégralité au plus tard à la livraison.
    // Or, pour ne pas la mettre en difficulté, {denomination_sociale_crediteur} lui a fait confiance et lui a "
    totalite_marchandise: "livré la totalite de la marchandise",
    totalite_prestation: "fourni la totalite des prestations",
    entreprise_française:
      "En application de l’article L. 441-6 du Code de commerce,les factures impayées font courir des intérêts légaux au taux de refinancement de la BCE majoré de 10 points, à compter de leur date d’échéance sans qu’un rappel soit nécessaire, outre le paiement d’une indemnité forfaitairepour frais de recouvrement de quarante euros par facture impayée et le remboursement de tous autres frais complémentaires de recouvrement.",
    entreprise_italienne:
      "En application du décret législatif italien du 9 novembre 2012 n°192 y compris ses modifications ultérieures, les factures impayées font courir des intérêts légaux au taux de refinancement de la BCE majoré de 8 points, à compter de leur date d’échéance sans qu’un rappel soit nécessaire, outre le paiement d’une indemnité forfaitaire pour frais de recouvrement de quarante euros par facture impayée et le remboursement de tous autres frais complémentaires de recouvrement.",
    calcul_total_interets: req.body.calcul_total_interets,
    honoraires_HT: req.body.honoraires_HT,
    honoraires_TTC: req.body.honoraires_TTC,
    calcul_total_creance_principale_HT: req.body.calcul_total_creance_principale_HT,
    calcul_total_creance_principale_TTC: req.body.calcul_total_creance_principale_TTC,
    nom_avocat: req.body.nom_avocat,
    adresse_cabinet: req.body.adresse_cabinet,
    tel_cabinet: req.body.tel_cabinet,
    fax_cabinet: req.body.fax_cabinet,
    mail_cabinet: req.body.mail_cabinet,
    num_tva_cabinet: req.body.num_tva_cabinet
  });
  try {
    // render the document
    doc.render();
  } catch (error) {
    console.log(JSON.stringify({ error: error }));
    throw error;
  }
  // debtor's name for the filename
  let debiteur_filename = "fcjn";

  // creditor's name  for the filename
  let creancier_filename = "vczkn";

  const buf = doc.getZip().generate({ type: "nodebuffer" });
  fs.writeFileSync(
    path.resolve(
      __dirname,
      `${today_file} - Mise en demeure - ${creancier_filename} contre ${debiteur_filename}.docx`
    ),
    buf
  );
});

module.exports = app;
