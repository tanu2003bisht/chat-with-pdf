const express = require('express')
const multer = require('multer')
const pdfParse = require('pdf-parse')
const fs = require('fs')
require('dotenv').config();
const {GoogleGenAI} = require('@google/genai');

const app = express()

const upload = multer({dest: "uploads/"})

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

app.get('/',(req,res) =>{
    res.send('Server is Up');
})

app.post('/upload', upload.single("pdf"), async(req,res) =>{
    console.log(req.file);
    try{
        const dataBuffer = fs.readFileSync(req.file.path)
        const pdfData = await pdfParse(dataBuffer)
        const text = pdfData.text
        
        //res.send(text)//for reading the data 2nd lecture
        const chunks = text.split('\n\n')
        console.log(chunks[0])

    // res.json({
    //     totalChunks: chunks.length,
    //     chunks

    const response = await ai.models.generateContent({
        model:'gemini-2.5-flash-lite',
        contents: `explain this pdf in simple text ${chunks[1]}`
    })
    res.send(response.text);
    }catch(err){
        console.log(err);
        res.status(500).send(err)
    }
})


app.listen(3000,() =>{
    console.log("server is running on port 3000");
})