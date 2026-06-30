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

 async function createEmbedding(text) {
        const response = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: text,
    });


    return response.embeddings[0].values;

        };


app.get('/',(req,res) =>{
    res.send('Server is Up');
})

app.post('/upload', upload.single("pdf"), async(req,res) =>{
    console.log(req.body);
    try{
        const dataBuffer = fs.readFileSync(req.file.path)
        const pdfData = await pdfParse(dataBuffer)
        const text = pdfData.text
        
        //res.send(text)//for reading the data 2nd lecture
        const chunks = text.split('\n\n').filter((chunk) => chunk.trim() != '');
        console.log(chunks);
        //console.log(chunks[0])


        const embedding = await createEmbedding(chunks[0]);
        console.log(embedding);

        const question = req.body.question;
        console.log(question);
        const matchedChunk = chunks.find((chunk)=> chunk.toLowerCase().includes('vocab'));



    // res.json({
    //     totalChunks: chunks.length,
    //     chunks

    const response = await ai.models.generateContent({
        model:'gemini-2.5-flash',
        contents: `answer the question using context: ${matchedChunk} and Question is: ${question}`
    })
    res.send(response.text);
    //only for checking the matchedChunk and response together
    // res.json({
    //     matchedChunk,
    //     response: response.text
    // })


    }catch(err){
        console.log(err);
        res.status(500).send(err)
    }
})


app.listen(3000,() =>{
    console.log("server is running on port 3000");
})