const models = require("../models");
const JSZip = require("jszip");
const Docxtemplater = require("docxtemplater");
const algo = require("../dojoalgo").maSuperMetaFonction;
const moment = require("moment");
moment().format();

const fs = require("fs");
const fsPromises = fs.promises;

const path = require("path");

const replaceDotsByCommas = float => {
  let stringifiedFloat = float.toString();
  let replacedNumber = stringifiedFloat.replace(".", ",");
  return replacedNumber;
};

module.exports = {
  createRecap: (req, res) => {
    models.action
      .findByPk(req.params.id, {
        include: [
          { model: models.creancier },
          { model: models.debiteur },
          {
            model: models.facture,
            where: { active: true },
            include: [
              {
                model: models.acompte,
                where: { active: true },
                required: false
              },
              { model: models.avoir, where: { active: true }, required: false },
              {
                model: models.partiel,
                where: { active: true },
                required: false
              }
            ]
          }
        ]
      })
      .then(async result => {
        let dateFinaleCalcul = result.date;
        let myFinalAlgoResult = [];
        let myFinalAlgoResultSorted = [];
        let myFinalAlgoResultSortedNoNumber = [];
        let nbreFactures = result.factures.length;
        let creanceTotaleSansPartielsTTC = [];
        let creanceTotaleSansPartielsHT = [];
        if (result.option_ttc_factures === true) {
          for (let i = 0; i < result.factures.length; i++) {
            let facture = {
              montant_ttc: result.factures[i].montant_ttc,
              echeance_facture: result.factures[i].echeance_facture
            };

            creanceTotaleSansPartielsTTC.push(result.factures[i].montant_ttc);

            let mesAcomptes = [];

            for (let j = 0; j < result.factures[i].acomptes.length; j++) {
              mesAcomptes.push({
                montant_ttc: result.factures[i].acomptes[j].montant_ttc
              });
              creanceTotaleSansPartielsTTC[i] -=
                result.factures[i].acomptes[j].montant_ttc;
            }

            let mesAvoirs = [];

            for (let k = 0; k < result.factures[i].avoirs.length; k++) {
              mesAvoirs.push({
                montant_ttc: result.factures[i].avoirs[k].montant_ttc
              });
              creanceTotaleSansPartielsTTC[i] -=
                result.factures[i].avoirs[k].montant_ttc;
            }

            let mesPaiementsPartiels = [];

            for (let l = 0; l < result.factures[i].partiels.length; l++) {
              mesPaiementsPartiels.push({
                montant_ttc: result.factures[i].partiels[l].montant_ttc,
                date_partiel: result.factures[i].partiels[l].date_partiel
              });
            }

            let dateFinCalculInterets = result.date;
            let points = result.taux_interets;
            let facture_number = "facture";

            myFinalAlgoResult.push({
              [facture_number]: await algo(
                facture,
                mesAcomptes,
                mesAvoirs,
                mesPaiementsPartiels,
                dateFinCalculInterets,
                points
              )
            });
            // console.log(creanceTotaleSansPartielsTTC);
          }
        } else {
          for (let i = 0; i < result.factures.length; i++) {
            let facture = {
              montant_ttc: result.factures[i].montant_ht,
              echeance_facture: result.factures[i].echeance_facture
            };

            creanceTotaleSansPartielsHT.push(result.factures[i].montant_ht);

            let mesAcomptes = [];

            for (let j = 0; j < result.factures[i].acomptes.length; j++) {
              mesAcomptes.push({
                montant_ttc: result.factures[i].acomptes[j].montant_ht
              });
              creanceTotaleSansPartielsHT[i] -=
                result.factures[i].acomptes[j].montant_ht;
            }

            let mesAvoirs = [];

            for (let k = 0; k < result.factures[i].avoirs.length; k++) {
              mesAvoirs.push({
                montant_ttc: result.factures[i].avoirs[k].montant_ht
              });
              creanceTotaleSansPartielsHT[i] -=
                result.factures[i].avoirs[k].montant_ht;
            }

            let mesPaiementsPartiels = [];

            for (let l = 0; l < result.factures[i].partiels.length; l++) {
              mesPaiementsPartiels.push({
                montant_ttc: result.factures[i].partiels[l].montant_ht,
                date_partiel: result.factures[i].partiels[l].date_partiel
              });
            }

            let dateFinCalculInterets = result.date;
            let points = result.taux_interets;
            let facture_number = "facture";

            myFinalAlgoResult.push({
              [facture_number]: await algo(
                facture,
                mesAcomptes,
                mesAvoirs,
                mesPaiementsPartiels,
                dateFinCalculInterets,
                points
              )
            });
          }
        }

        // console.log(JSON.stringify(myFinalAlgoResult, null, 2));

        // myFinalAlgoResultSorted retourne un objet de ce style
        //   [ { facture_0:
        //     [ [Object],
        //       [Object],
        //       [Object] ] },
        //  { facture_1:
        //     [ [Object], [Object], [Object] ] } ]
        // chaque objet est composé de la sorte:
        // facture_0: [{ date_debut: '01/07/2018',
        // date_fin: '20/12/2018',
        // creance_sur_cette_periode: 7300,
        // nbre_jours_comptabilises: 173,
        // interets_periode: 346,
        // taux_interet_applique: 0 }]

        /////// TO BE RESTORED IF CHANGE OF SORTING ALGO DOES NOT FUNCTION //////

        // for (let i = 0; i < myFinalAlgoResult.length; i++) {
        //   let numberFacture = "facture_";

        //   let mySortedResult = myFinalAlgoResult[i].facture.sort(
        //     (item, otherItem) => {
        //       dateDebutPremierItem = moment(
        //         item.date_debut,
        //         "DD/MM/YYYY",
        //         true
        //       );
        //       dateDebutSecondItem = moment(
        //         otherItem.date_debut,
        //         "DD/MM/YYYY",
        //         true
        //       );
        //       let mySorted = dateDebutPremierItem.diff(dateDebutSecondItem);
        //       return +mySorted;
        //     }
        //   );

        //   myFinalAlgoResultSorted.push({ [numberFacture + i]: mySortedResult });
        //   myFinalAlgoResultSortedNoNumber.push({ facture: mySortedResult });
        // }

        //////// EN OF RESTORE //////////////

        const reverseDateRepresentation = date => {
          let parts = date.split("/");
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        };

        const sortedDates = [];

        for (let i = 0; i < myFinalAlgoResult.length; i++) {
          sortedDates.push(myFinalAlgoResult[i].facture[0].date_debut);
        }

        let superSorted = sortedDates
          .map(reverseDateRepresentation)
          .sort()
          .map(reverseDateRepresentation);

        for (let i = 0; i < superSorted.length; i++) {
          let numberFacture = "facture_";
          for (let j = 0; j < myFinalAlgoResult.length; j++) {
            if (superSorted[i] === myFinalAlgoResult[j].facture[0].date_debut) {
              myFinalAlgoResultSorted.push({
                [numberFacture + i]: myFinalAlgoResult[j].facture[0]
              });
              myFinalAlgoResultSortedNoNumber.push({
                facture: myFinalAlgoResult[j].facture[0]
              });
            }
          }
        }

        //   let infosRecap = [];
        //   for (let i = 0; i < myFinalAlgoResultSorted.length; i++) {
        //     Object.keys(myFinalAlgoResultSorted[i]).forEach(function(key, index) {
        //       infosRecap.push(myFinalAlgoResultSorted[i][key]);
        //     });
        //   }

        //   let recap = [];

        //   for (let i = 0; i < infosRecap.length; i++) {
        //     for (let j = 0; j < infosRecap[i].length; j++) {
        //      recap.push(infosRecap[i][j]);
        //   }
        // }
        // console.log(infosRecap)

        ////////////////////////////////////////////////////
        // CETTE SECTION SERT A CALCULER LE MONTANT TOTAL //
        // DES INTERETS POUR TTES LES FACTURES            //
        ////////////////////////////////////////////////////

        let montantTotalInterets = 0;

        for (let i = 0; i < myFinalAlgoResultSortedNoNumber.length; i++) {
          for (
            let j = 0;
            j < myFinalAlgoResultSortedNoNumber[i].facture.length;
            j++
          ) {
            montantTotalInterets +=
              myFinalAlgoResultSortedNoNumber[i].facture[j].interets_periode;
          }
        }

        let montantTotalInteretsToutesFactures = parseFloat(
          montantTotalInterets.toFixed(2)
        );

        ////////////////////////////////////////////////////
        //               FIN DE SECTION                   //
        //                                                //
        ////////////////////////////////////////////////////

        /////////////////////////////////////////////////////////////////
        // CETTE SECTION EXPLIQUE COMMENT EST CALCULE LE MONTANT TOTAL //
        // DE LA CREANCE MOINS LES ACOMPTES ET AVOIRS                  //
        // DEJA PAYES (MAIS SANS LES PAIEMENTS PARTIELS)               //
        ////////////////////////////////////////////////////////////////

        // console.log(creanceTotaleSansPartielsTTC, creanceTotaleSansPartielsHT);

        // creanceTotaleSansPartielsTTC sera rempli comme un tableau d'entiers
        // uniquement si option_ttc_factures est réglé sur true dans l'action

        // creanceTotaleSansPartielsHT sera rempli comme un tableau d'entiers
        // uniquement si option_ttc_factures est réglé sur false dans l'action

        // si le tableau TTC est rempli, celui en HT sera vide et vice versa.

        ////////////////////////////////////////////////////
        //               FIN DE SECTION                   //
        //                                                //
        ////////////////////////////////////////////////////

        // let tabTTC = [];

        // for (let i = 0; i < creanceTotaleSansPartielsTTC.length; i++) {
        //   tabTTC.push([creanceTotaleSansPartielsTTC[i]]);
        // }

        // let tabHT = [];
        // for (let i = 0; i < creanceTotaleSansPartielsHT.length; i++) {
        //   tabHT.push([creanceTotaleSansPartielsHT[i]]);
        // }

        fsPromises
          .readFile(
            path.resolve(
              __dirname,
              "../docxtemplating/matrice_tableau_recapitulatif.docx"
            ),
            "binary"
          )
          .then(content => {
            const zip = new JSZip(content);

            const doc = new Docxtemplater();
            doc.loadZip(zip);

            //set today's date
            let today = new Date();
            let dd = today.getDate();
            let mm = today.getMonth() + 1; // january is 0...
            let yyyy = today.getFullYear();
            let zzzz = today.getFullYear();
            let stringifiedYear = yyyy.toString();
            let replacedYear = stringifiedYear.replace("20", "");
            yyyy = parseInt(replacedYear);

            if (dd < 10) {
              dd = "0" + dd;
            }
            if (mm < 10) {
              mm = "0" + mm;
            }

            today = dd + "/" + mm + "/" + yyyy; // date for the word document
            let today2 = dd + "/" + mm + "/" + zzzz; // date for the subtitle
            today_file = yyyy + mm + dd; // date for the file name
            // console.log(myFinalAlgoResultSorted)

            doc.setData({
              denomination_sociale_creancier:
                result.creancier.denomination_sociale,
              denomination_sociale_debiteur:
                result.debiteur.denomination_sociale,
              date: dateFinaleCalcul,
              factures: result.factures.map((facture, index) => {
                return {
                  numero_facture: facture.num_facture,
                  date_facture: facture.date_facture,
                  echeance_facture: facture.echeance_facture,
                  montant_facture_HT: replaceDotsByCommas(
                    facture.montant_ht.toFixed(2)
                  ),
                  isFacturesHT:
                    result.option_ttc_factures === false ? true : false,
                  montant_facture_TTC: replaceDotsByCommas(
                    facture.montant_ttc.toFixed(2)
                  ),
                  isFacturesTTC:
                    result.option_ttc_factures === true ? true : false,
                  montant_creance: replaceDotsByCommas(
                    myFinalAlgoResultSorted[index][
                      `facture_${index}`
                    ][0].creance_sur_cette_periode.toFixed(2)
                  ),

                  infoRecap: myFinalAlgoResultSorted[index][
                    `facture_${index}`
                  ].map(newRecap => {
                    return {
                      date_debut: newRecap.date_debut,
                      date_fin: newRecap.date_fin,
                      nombre_jours_interets: newRecap.nbre_jours_comptabilises,
                      tauxFr: newRecap.taux_interet_applique + 10,
                      tauxIt: newRecap.taux_interet_applique + 8,
                      isTauxFr: result.taux_interets === 10 ? true : false,
                      isTauxIt: result.taux_interets === 8 ? true : false,
                      montant_interets: replaceDotsByCommas(
                        newRecap.interets_periode.toFixed(2)
                      ),
                      montant_creance: replaceDotsByCommas(
                        newRecap.creance_sur_cette_periode.toFixed(2)
                      )
                    };
                  })
                };
              }),
              taux_BCE: "",
              points_entreprise_française: "de 10 points",
              points_entreprise_italienne: "de 8 points",

              // tableauTTC: tabTTC.map(newTabTTC => {
              //   return {
              //     montant_ttc: newTabTTC,
              //     isTTC: result.option_ttc_factures === true ? true : false
              //   };
              // })[0],
              // tableauHT: tabHT.map(newTabHT => {
              //   return {
              //     montant_ht: newTabHT,
              //     isHT: result.option_ttc_factures === false ? true : false
              //   };
              // })[0],
              date_reglement_acompte: "",
              montant_acompte: "",
              montant_total_interets: replaceDotsByCommas(
                montantTotalInteretsToutesFactures
              ),
              loi_entreprise_française:
                "En application de l’article L. 441-6 du Code de commerce, les factures impayées font courir des intérêts légaux au taux de refinancement de la BCE majoré de 10 points, à compter de leur date d’échéance sans qu’un rappel soit nécessaire, outre le paiement d’une indemnité forfaitaire pour frais de recouvrement de quarante euros par facture impayée et le remboursement de tous autres frais complémentaires de recouvrement.",
              loi_entreprise_italienne:
                "En application du décret législatif italien du 9 novembre 2012 n°192 y compris ses modifications ultérieures, les factures impayées font courir des intérêts légaux au taux de refinancement de la BCE majoré de 8 points, à compter de leur date d’échéance sans qu’un rappel soit nécessaire, outre le paiement d’une indemnité forfaitaire pour frais de recouvrement de quarante euros par facture impayée et le remboursement de tous autres frais complémentaires de recouvrement.",
              isEntrepriseFrançaise: result.taux_interets === 10 ? true : false,
              isEntrepriseItalienne: result.taux_interets === 8 ? true : false
            });

            // debtor's name for the filename
            let debiteur_filename = result.debiteur.denomination_sociale;

            // creditor's name  for the filename
            let creancier_filename = result.creancier.denomination_sociale;

            try {
              // render the document
              doc.render();
            } catch (error) {
              const e = {
                message: error.mesage,
                name: error.name,
                stack: error.stack,
                properties: error.properties
              };
              console.log(JSON.stringify({ error: e }));
              throw error;
            }

            const buf = doc.getZip().generate({ type: "nodebuffer" });

            fsPromises
              .writeFile(
                path.resolve(
                  __dirname,
                  `../public/documents/${today_file} - Calcul intérêts - ${creancier_filename} c. ${debiteur_filename}.docx`
                ),
                buf
              )
              .then(() =>
                res.send(
                  `${today_file} - Calcul intérêts - ${creancier_filename} c. ${debiteur_filename}.docx`
                )
              )
              .catch(err => console.log(err));
          })
          .catch(err => console.log(err));

        //res.send(result);
      });
  }
};
