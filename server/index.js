const express = require('express')
const multer = require('multer')
const pdfParse = require('pdf-parse')
const fs = require('fs')
const app = express()

const upload = multer({dest: "uploads/"})

app.get('/',(req,res) =>{
    res.send('Server is Up');
})

app.post('/upload', upload.single("pdf"), async(req,res) =>{
    console.log(req.file);
    const dataBuffer = fs.readFileSync(req.file.path)
    const pdfData = await pdfParse(dataBuffer)
    const text = pdfData.text
    res.send(text);
})

app.listen(3000,() =>{
    console.log("server is running on port 3000");
})