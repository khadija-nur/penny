const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var imageSchema = new Schema(
    { img: 
        String }
    
  );

let Image = mongoose.model('Images',imageSchema);

module.exports = Image