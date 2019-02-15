const moment = require("moment");
moment().format();

let myFinalAlgoResult = [
  {
    facture: [
      {
        date_debut: "31/10/2017",
        date_fin: "15/12/2017"
      }
    ]
  },
  {
    facture: [
      {
        date_debut: "31/12/2018",
        date_fin: "14/02/2019"
      }
    ]
  },
  {
    facture: [
      {
        date_debut: "03/03/2019",
        date_fin: "14/05/2019"
      }
    ]
  },
  {
    facture: [
      {
        date_debut: "30/04/2018",
        date_fin: "14/06/2018"
      }
    ]
  },
  {
    facture: [
      {
        date_debut: "28/02/2018",
        date_fin: "14/04/2018"
      }
    ]
  }
];

let myFinalAlgoResultSorted = [];
let myFinalAlgoResultSortedNoNumber = [];

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
        [numberFacture + i]: myFinalAlgoResult[j].facture
      });
      myFinalAlgoResultSortedNoNumber.push({
        facture: myFinalAlgoResult[j].facture
      });
    }
  }
}

// { [numberFacture + i]: mySortedResult }

console.log(myFinalAlgoResultSorted[0]);

// console.log(myFinalAlgoResult[0].facture);

// for (let i = 0; i < myFinalAlgoResult.length; i++) {
//   let numberFacture = "facture_";

//   let mySortedResult = myFinalAlgoResult.sort((item, otherItem) => {
//     dateDebutPremierItem = moment(item.facture.date_debut, "DD/MM/YYYY", true);
//     dateDebutSecondItem = moment(
//       otherItem.facture.date_debut,
//       "DD/MM/YYYY",
//       true
//     );
//     let mySorted1 = dateDebutPremierItem.diff(dateDebutSecondItem);
//     console.log(`mySorted1 = ${mySorted1}`);
//     let mySorted2 = dateDebutSecondItem.diff(dateDebutPremierItem);
//     console.log(`mySorted2 = ${mySorted2}`);
//     return mySorted2 - mySorted1;
//   });

//   myFinalAlgoResultSorted.push(mySortedResult);
// }

// console.log(myFinalAlgoResultSorted);
