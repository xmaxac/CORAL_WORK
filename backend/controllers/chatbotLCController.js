import {PDFExtract} from 'pdf.js-extract'
import path from "path";
import fs from "fs";
import dotenv from 'dotenv';

import {createStuffDocumentsChain} from "langchain/chains/combine_documents";
import { Document } from "langchain/document";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import {createRetrievalChain} from "langchain/chains/retrieval";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
// import {PGVectorStore} from "@langchain/community/vectorstores/pgvector";

// get text from pdfs
async function extractTextFromPDF(file_path) {
    const pdfExtract = new PDFExtract();
    const buffer = fs.readFileSync(file_path);
    return new Promise((resolve, reject) => {
        pdfExtract.extractBuffer(buffer, {}, (err, data) => {
            if (err) return reject(err);
            const basename = path.parse(file_path).name;
            const numPages = data.pages.length;
            const selectedPages = data.pages.slice(1, numPages - 1);
            const text = selectedPages.map(page =>
                page.content.map(item => item.str).join(' ')
              ).join('\n');
              resolve({ text, numPages, basename});
            });
    }); 
}
// write pdf file to text
// example use: writeToTxt("../embedded_data/Pathology_of_lesions_in_corals_from_the_US_Virgin_.pdf");
async function writeToTxt(file_path){
    const {text, numPages, basename} = await extractTextFromPDF(file_path);
    const textpath = `../embedded_data_txt/${basename}.txt`
    fs.writeFileSync(textpath, text, "utf-8");
}

import { ChatOpenAI, OpenAIEmbeddings} from '@langchain/openai';
import {ChatPromptTemplate} from '@langchain/core/prompts'
import { fileURLToPath } from 'url';

// get the openaiapi key from .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log(process.env.OPENAIAPIKEYLC)

const model = new ChatOpenAI({
    modelName : "gpt-4-turbo" ,
    temperature: 0,
    openAIApiKey: process.env.OPENAIAPIKEYLC 
});

const prompt = ChatPromptTemplate.fromMessages([
    `Answer the user's question. 
    Context: {context}
    Question: {input}
    `
]);
const loader = new CheerioWebBaseLoader(
    "https://cdhc.noaa.gov/coral-disease/characterized-diseases/stony-coral-tissue-loss-disease-sctld/"
)
const docs = await loader.load()
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 200, 
    chunkOverlap: 20
})

const key = process.env.OPENAIAPIKEYLC
const embeddings = new OpenAIEmbeddings({apiKey:key})
const splitDocs = await splitter.splitDocuments(docs);
const vectorstore = await MemoryVectorStore.fromDocuments(
    splitDocs, 
    embeddings
); 

const documentA = new Document({
    pageContent: "The spread of SCTLD around the island of St. Thomas and to neighboring islands has been rapid and unrelenting"
});
const documentB = new Document({
    pageContent: "the spread of sctld is higly contagious, starting form the coast of miami and spreading to the carribean."
})
const chain = await createStuffDocumentsChain({
    llm: model, 
    prompt: prompt
});
// retrieve data
const retriever = vectorstore.asRetriever({
    k:3
})
const retrievalchain = await createRetrievalChain({
    combineDocsChain: chain, 
    retriever: retriever
})
const response = await retrievalchain.invoke({
    input: "how is the the spread of sctld in st thomas"
});

console.log(response);
// const loader = new CheerioWebBaseLoader()
// // const chain = prompt.pipe(model);
// // const response = await chain.invoke({
// //     input: "what is sctld?"
// // })

// // console.log(response);

// // async function callStringOutputParser(){
// //     // create prompt template 
    

// //     const parser = new StructuredOutputParser();
// //     //create chain
// //     const chain = prompt.pipe(model).pipe(parser);
// //     const response = await chain.invoke({
// //         input: "what is the mortality rate of SCTLD?"
// //     });
// //     return response; 
// // }


// // const result = await callStringOutputParser();
// // console.log(result);

