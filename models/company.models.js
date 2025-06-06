const { Schema, default: mongoose } = require('mongoose')

const companySchema = new Schema({
    company_id: {
        type: String,
        required: true
    },
    client_id: {
        type: String,
    }
},{timestamps:true})

const Company = mongoose.model('Company', companySchema)

module.exports = Company
