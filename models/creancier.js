"use strict";
module.exports = (sequelize, DataTypes) => {
  const creancier = sequelize.define(
    "creancier",
    {
      denomination_sociale: DataTypes.STRING,
      forme_juridique: DataTypes.STRING,
      nationalite_societe: DataTypes.STRING,
      adresse_siege: DataTypes.STRING,
      code_postal_siege: DataTypes.STRING,
      ville_siege: DataTypes.STRING,
      pays_siege: DataTypes.STRING,
      ville_rcs: DataTypes.STRING,
      num_rcs: DataTypes.STRING,
      num_CCIAA: DataTypes.STRING,
      num_reg_soc: DataTypes.STRING,
      num_cod_fisc_tva: DataTypes.STRING,
      capital_social: DataTypes.STRING,
      nom: DataTypes.STRING,
      prenom: DataTypes.STRING,
      civilite: DataTypes.STRING,
      fonction: DataTypes.STRING,
      active: DataTypes.BOOLEAN
    },
    {}
  );
  creancier.associate = function(models) {
    // associations can be defined here
    creancier.belongsTo(models.cabinet);
    creancier.hasMany(models.action);
  };
  return creancier;
};
